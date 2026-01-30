"""
================================================================================
MONITOR110 REVIVAL - FLASK BACKEND
================================================================================
FAIL.EXE Hackathon - Manipal University Jaipur

SYSTEM ARCHITECTURE:
--------------------
This Flask backend serves as the core processing engine for the Monitor110 revival.
It connects to a Next.js frontend (port 3000) and provides real-time financial 
sentiment analysis with Telegram push notifications.

    ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
    │  Next.js UI     │────▶│  Flask API      │────▶│  Telegram Bot   │
    │  (Port 3000)    │     │  (Port 5000)    │     │  Push Alerts    │
    └─────────────────┘     └────────┬────────┘     └─────────────────┘
                                     │
                            ┌────────┴────────┐
                            │  VADER Sentiment │
                            │  Analysis Engine │
                            └─────────────────┘

CORE TECHNICAL CONTRIBUTION:
----------------------------
The original Monitor110 failed in 2008 because it created "information overload" -
aggregating too much noise without filtering. Our revival fixes this with:

1. SENTIMENT FILTERING: Using VADER (Valence Aware Dictionary for Sentiment 
   Reasoning) to score news snippets and highlight only critical negative moves.
   
2. PUSH DELIVERY: Instead of requiring professionals to monitor a dashboard 24/7,
   we use Telegram bot API to proactively push alerts when negative sentiment 
   matches a user's watchlist keywords.

API ENDPOINTS:
--------------
GET  /api/signals       - Returns all signals with sentiment scores
POST /api/connect       - Saves user's Telegram credentials
POST /api/watchlist     - Adds keywords to user's monitoring list  
POST /api/trigger-check - Scans signals and sends alerts for negative matches

================================================================================
"""

import os
import json
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import yfinance as yf
from google import genai
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

# Load environment variables from .env file
load_dotenv()

# ============================================================================
# APP INITIALIZATION
# ============================================================================
# Flask app with CORS enabled for Next.js frontend communication
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Initialize VADER sentiment analyzer
analyzer = SentimentIntensityAnalyzer()

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"

# Gemini/Gemma LLM Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        llm_available = True
    except Exception as e:
        print(f"Failed to initialize Gemini client: {e}")
        llm_available = False
else:
    llm_available = False

# Data file path for persistent storage
DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")

# ============================================================================
# MOCK FINANCIAL SIGNALS
# ============================================================================
# These simulate real-time financial news that would come from APIs like:
# Bloomberg, Reuters, Twitter/X, Reddit r/wallstreetbets, etc.
# In production, these would be fetched from actual news APIs.

MOCK_SIGNALS = [
    {
        "id": 1,
        "source": "Reuters",
        "headline": "Apple reports record quarterly earnings, stock surges 5%",
        "content": "Apple Inc. announced exceptional quarterly results, beating analyst expectations.",
        "keywords": ["Apple", "AAPL", "earnings"]
    },
    {
        "id": 2,
        "source": "Bloomberg",
        "headline": "Bitcoin crashes 15% amid regulatory fears",
        "content": "Cryptocurrency markets tumble as SEC announces new enforcement actions against major exchanges.",
        "keywords": ["Bitcoin", "BTC", "crypto", "SEC"]
    },
    {
        "id": 3,
        "source": "CNBC",
        "headline": "Tesla faces production delays, shares drop 8%",
        "content": "Tesla Inc. announced significant production challenges at its Berlin factory, causing investor concern.",
        "keywords": ["Tesla", "TSLA", "EV"]
    },
    {
        "id": 4,
        "source": "Financial Times",
        "headline": "Microsoft Azure growth exceeds expectations",
        "content": "Microsoft's cloud computing division continues strong performance, driving overall company growth.",
        "keywords": ["Microsoft", "MSFT", "Azure", "cloud"]
    },
    {
        "id": 5,
        "source": "Twitter/X",
        "headline": "BREAKING: Major bank announces massive layoffs",
        "content": "One of the largest investment banks is cutting 10,000 jobs worldwide amid economic uncertainty.",
        "keywords": ["banking", "layoffs", "recession"]
    },
    {
        "id": 6,
        "source": "Reddit r/wallstreetbets",
        "headline": "GameStop sees unusual trading activity again",
        "content": "Retail investors are buzzing about potential short squeeze opportunities in GME stock.",
        "keywords": ["GameStop", "GME", "meme stocks"]
    },
    {
        "id": 7,
        "source": "Associated Press",
        "headline": "Oil prices stable as OPEC maintains production levels",
        "content": "Crude oil markets remain steady following OPEC's decision to keep current output quotas.",
        "keywords": ["oil", "OPEC", "energy"]
    },
    {
        "id": 8,
        "source": "CoinDesk",
        "headline": "Ethereum upgrade causes network instability",
        "content": "The latest Ethereum protocol update has resulted in temporary network congestion and failed transactions.",
        "keywords": ["Ethereum", "ETH", "crypto"]
    }
]

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def load_data():
    """
    Load user data from local JSON file.
    Creates file with empty structure if it doesn't exist.
    
    Returns:
        dict: User data containing profiles and watchlists
    """
    if not os.path.exists(DATA_FILE):
        default_data = {"users": {}}
        save_data(default_data)
        return default_data
    
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_data(data):
    """
    Persist user data to local JSON file.
    
    Args:
        data (dict): User data to save
    """
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


def analyze_sentiment(text):
    """
    Analyze sentiment of text using VADER.
    
    VADER returns a compound score between -1 (extremely negative) and +1 (extremely positive).
    We classify based on standard thresholds:
    - Positive: compound >= 0.05
    - Negative: compound <= -0.05
    - Neutral: -0.05 < compound < 0.05
    
    Args:
        text (str): Text to analyze
        
    Returns:
        tuple: (label, compound_score) where label is 'Positive'/'Negative'/'Neutral'
    """
    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]
    
    if compound >= 0.05:
        label = "Positive"
    elif compound <= -0.05:
        label = "Negative"
    else:
        label = "Neutral"
    
    return label, compound


def send_telegram_alert(chat_id, message):
    """
    Send alert message to user via Telegram Bot API.
    
    This is the core "push notification" feature that addresses Monitor110's
    original failure - users no longer need to actively monitor a dashboard.
    
    Args:
        chat_id (str): Telegram chat ID of the recipient
        message (str): Alert message to send
        
    Returns:
        bool: True if message sent successfully, False otherwise
    """
    if not TELEGRAM_BOT_TOKEN:
        print("[WARNING] TELEGRAM_BOT_TOKEN not set - skipping Telegram delivery")
        return False
    
    try:
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown"
        }
        response = requests.post(TELEGRAM_API_URL, json=payload, timeout=10)
        return response.status_code == 200
    except requests.RequestException as e:
        print(f"[ERROR] Failed to send Telegram message: {e}")
        return False


# ============================================================================
# REAL DATA FETCHERS - No API keys required!
# ============================================================================

def fetch_reddit_signals(subreddits=["IndianStockMarket", "StockMarketIndia", "IndianStreetBets", "stocks", "investing"], limit=8):
    """
    Fetch posts from Reddit using public JSON endpoint.
    No API key needed - just append .json to any Reddit URL.
    Filters out low-quality posts like daily threads.
    """
    signals = []
    headers = {"User-Agent": "Monitor110/1.0"}
    
    # Skip these low-quality post patterns
    skip_patterns = [
        "daily discussion", "weekly discussion", "weekly earnings",
        "what are your moves", "weekend discussion", "daily thread",
        "megathread", "meta thread", "not supported on old reddit"
    ]
    
    for subreddit in subreddits:
        try:
            url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit={limit}"
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                posts = data.get("data", {}).get("children", [])
                
                for post in posts:
                    post_data = post.get("data", {})
                    title = post_data.get("title", "")
                    selftext = post_data.get("selftext", "")[:200]
                    
                    # Skip stickied posts, low-quality posts
                    if post_data.get("stickied"):
                        continue
                    
                    # Skip posts matching skip patterns
                    title_lower = title.lower()
                    content_lower = selftext.lower()
                    if any(pattern in title_lower or pattern in content_lower for pattern in skip_patterns):
                        continue
                    
                    # Skip very short titles (likely not useful)
                    if len(title) < 20:
                        continue
                    
                    if title:
                        signals.append({
                            "id": f"reddit_{post_data.get('id', '')}",
                            "source": f"Reddit r/{subreddit}",
                            "headline": title,
                            "content": selftext or title,
                            "keywords": extract_keywords(title)
                        })
        except Exception as e:
            print(f"[WARNING] Reddit r/{subreddit} fetch failed: {e}")
    
    
    return signals


def fetch_yahoo_signals(tickers=["AAPL", "TSLA", "BTC-USD", "ETH-USD"], limit=3):
    """
    Fetch news from Yahoo Finance using yfinance library.
    No API key needed.
    """
    signals = []
    
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            news = stock.news[:limit] if hasattr(stock, 'news') and stock.news else []
            
            for item in news:
                # yfinance now has nested 'content' structure
                content = item.get("content", item)  # fallback to item itself
                title = content.get("title", "") if isinstance(content, dict) else ""
                summary = content.get("summary", title) if isinstance(content, dict) else title
                news_id = content.get("id", "")[:8] if isinstance(content, dict) else ""
                
                if title:  # Only add if we have a title
                    signals.append({
                        "id": f"yahoo_{news_id}",
                        "source": f"Yahoo Finance ({ticker})",
                        "headline": title,
                        "content": summary or title,
                        "keywords": [ticker] + extract_keywords(title)
                    })
        except Exception as e:
            print(f"[WARNING] Yahoo Finance {ticker} fetch failed: {e}")
    
    return signals


def fetch_moneycontrol_signals(limit=5):
    """
    Scrape headlines from Moneycontrol using BeautifulSoup.
    No API key needed.
    """
    signals = []
    
    try:
        url = "https://www.moneycontrol.com/news/business/markets/"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "lxml")
            
            # Find news headlines
            articles = soup.find_all("li", class_="clearfix")[:limit]
            
            for i, article in enumerate(articles):
                headline_tag = article.find("h2") or article.find("a")
                if headline_tag:
                    headline = headline_tag.get_text(strip=True)
                    if headline and len(headline) > 10:
                        signals.append({
                            "id": f"moneycontrol_{i}",
                            "source": "Moneycontrol",
                            "headline": headline,
                            "content": headline,
                            "keywords": extract_keywords(headline)
                        })
    except Exception as e:
        print(f"[WARNING] Moneycontrol scrape failed: {e}")
    
    return signals


def extract_keywords(text):
    """
    Extract potential financial keywords from text.
    Looks for stock tickers, crypto names, and common terms.
    """
    # Common financial terms to look for
    known_keywords = [
        "Apple", "AAPL", "Tesla", "TSLA", "Microsoft", "MSFT", "Google", "GOOGL",
        "Amazon", "AMZN", "Meta", "META", "Netflix", "NFLX", "Nvidia", "NVDA",
        "Bitcoin", "BTC", "Ethereum", "ETH", "crypto", "SEC", "Fed", "inflation",
        "recession", "earnings", "IPO", "stocks", "market", "crash", "rally",
        "Sensex", "Nifty", "RBI", "rupee", "banks", "oil", "gold"
    ]
    
    found = []
    text_lower = text.lower()
    
    for keyword in known_keywords:
        if keyword.lower() in text_lower:
            found.append(keyword)
    
    return found[:5] if found else ["general"]


def fetch_all_signals():
    """
    Fetch signals from all sources and combine them.
    Falls back to MOCK_SIGNALS if all fetchers fail.
    """
    all_signals = []
    
    # Fetch from all sources
    print("[INFO] Fetching Reddit signals...")
    all_signals.extend(fetch_reddit_signals())
    
    print("[INFO] Fetching Yahoo Finance signals...")
    all_signals.extend(fetch_yahoo_signals())
    
    print("[INFO] Fetching Moneycontrol signals...")
    all_signals.extend(fetch_moneycontrol_signals())
    
    # Fallback to mock data if nothing was fetched
    if not all_signals:
        print("[WARNING] All fetchers failed, using MOCK_SIGNALS")
        return MOCK_SIGNALS
    
    print(f"[INFO] Fetched {len(all_signals)} real signals")
    return all_signals


def analyze_signals_with_llm(signals):
    """
    Analyzes signals using VADER sentiment analysis for speed and reliability.
    (LLM removed from this specific path to ensure instant alerts without rate limits).
    """
    analyzed = []
    bearish_count = 0
    bullish_count = 0
    
    for signal in signals:
        full_text = f"{signal.get('headline', '')} {signal.get('content', '')}"
        sentiment_label, sentiment_score = analyze_sentiment(full_text)
        
        # Simple urgency logic
        urgency = "low"
        if sentiment_label == "Negative":
            bearish_count += 1
            if sentiment_score < -0.5:
                urgency = "high"
            if "crash" in full_text.lower() or "plunge" in full_text.lower():
                urgency = "critical"
        elif sentiment_label == "Positive":
            bullish_count += 1
            
        analyzed.append({
            **signal,
            "sentiment": sentiment_label,
            "sentiment_score": round(sentiment_score, 3),
            "ai_analysis": f"VADER Score: {sentiment_score:.2f} ({sentiment_label})",
            "urgency": urgency,
            "recommendation": "Monitor" if urgency in ["high", "critical"] else "Hold"
        })
        
    market_state = "Bearish" if bearish_count > bullish_count else "Bullish"
    market_summary = f"Validating {len(signals)} signals. Market appears lean towards {market_state} sentiment."
    
    return analyzed, market_summary


# ============================================================================
# API ENDPOINTS - Bearish & Bullish with Structured Response
# ============================================================================

app.config['JSON_AS_ASCII'] = False  # Allow special characters like ₹ in JSON

def generate_market_analysis(sentiment_type, signals):
    """
    Single LLM call to generate complete market analysis.
    LLM rewrites raw data into professional format.
    """
    # Gather raw headlines for LLM to process
    headlines_text = "\n".join([
        f"- {s.get('headline', '')} | {s.get('content', '')[:100]} (Source: {s.get('source', 'Unknown')})" 
        for s in signals[:12]
    ])
    
    if not llm_available:
        return {
            "live_signals": [{"title": "LLM Unavailable", "details": "Configure GEMINI_API_KEY", "source": "System"}],
            "top_picks": [{"name": "N/A", "action": "hold", "price": "N/A", "reason": "LLM required"}],
            "market_summary": "AI analysis unavailable. Please configure GEMINI_API_KEY.",
            "llm_advice": "Set up your Gemini API key to get AI-powered insights."
        }
    
    action_word = "sell" if sentiment_type == "bearish" else "buy"
    sentiment_desc = "negative/bearish" if sentiment_type == "bearish" else "positive/bullish"
    
    prompt = f"""You are a professional financial news analyst for an INDIAN AUDIENCE. Analyze these raw market signals and create a polished {sentiment_type.upper()} market report.

RAW DATA (from Reddit, Yahoo Finance, Moneycontrol):
{headlines_text}

IMPORTANT RULES:
1. DO NOT copy raw Reddit titles - rewrite them professionally 
2. Create clear, professional headlines like a Bloomberg or CNBC news anchor would write
3. Focus on the {sentiment_desc} angle of the news
4. MANDATORY: All prices must be in INDIAN RUPEES (INR/₹).
5. PRICE REALISM CHEAT SHEET (approx):
   - Nifty 50: ₹23,500 - ₹24,500
   - Sensex: ₹77,000 - ₹80,000
   - Gold (10g): ₹78,000 - ₹82,000
   - Silver (1kg): ₹90,000 - ₹95,000
   - Reliance: ₹1,200 - ₹1,400 (post-bonus) or ₹2,500 range
   - HDFC Bank: ₹1,600 - ₹1,800
   - Tata Motors: ₹700 - ₹900
   - SBI: ₹800 - ₹900
   - USD/INR: ₹84-85

Respond with ONLY valid JSON (no markdown, no extra text):
{{
    "live_signals": [
        {{"title": "Professional headline about market event", "details": "explanation", "source": "Source name"}},
        {{"title": "Another professional headline", "details": "explanation", "source": "Source"}},
        {{"title": "Third headline", "details": "Explanation", "source": "Source"}},
        {{"title": "Fourth headline", "details": "Explanation", "source": "Source"}}
    ],
    "top_picks": [
        {{"name": "TICKER (Indian)", "action": "{action_word}", "price": "₹XXXX", "reason": "Brief professional reason"}},
        {{"name": "TICKER2", "action": "{action_word}", "price": "₹XXXX", "reason": "Brief reason"}},
        {{"name": "TICKER3", "action": "{action_word}", "price": "₹XXXX", "reason": "Brief reason"}}
    ],
    "market_summary": "Professional summary of {sentiment_type} market conditions.",
    "llm_advice": "Actionable advice for {sentiment_type} market."
}}"""

    try:
        model_name = "gemma-3-27b-it"
        print(f"[INFO] Analyzing with {model_name}...")
        
        response = client.models.generate_content(
            model=model_name,
            contents=prompt
        )
        
        result_text = response.text.strip()
        
        # Clean up potential markdown
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        result_text = result_text.strip()
        
        return json.loads(result_text)
        
    except Exception as e:
        print(f"[ERROR] LLM analysis failed: {e}")
        return {
            "live_signals": [
                {"title": "AI Analysis Unavailable", "details": f"Error: {str(e)[:50]}", "source": "System"}
            ],
            "top_picks": [
                {"name": "NIFTY50", "action": "monitor", "price": "₹24,000", "reason": "System fallback"},
                {"name": "GOLD", "action": "monitor", "price": "₹78,000", "reason": "Volatility"},
                {"name": "RELIANCE", "action": "hold", "price": "₹1,300", "reason": "Wait for analysis"}
            ],
            "market_summary": f"Market analysis unavailable due to API error. Please try again later.",
            "llm_advice": "Unable to generate advice at this moment."
        }
    



@app.route("/api/bearish", methods=["GET"])
def get_bearish_signals():
    """
    GET /api/bearish
    
    Returns structured bearish market analysis:
    - 4 live bearish signals with details
    - Top 3 stocks to sell with prices
    - Market summary paragraph
    - LLM advice for bearish conditions
    """
    real_signals = fetch_all_signals()
    analysis = generate_market_analysis("bearish", real_signals)
    
    return jsonify({
        "success": True,
        "sentiment": "bearish",
        **analysis
    })


@app.route("/api/bullish", methods=["GET"])
def get_bullish_signals():
    """
    GET /api/bullish
    
    Returns structured bullish market analysis:
    - 4 live bullish signals with details  
    - Top 3 stocks to buy with prices
    - Market summary paragraph
    - LLM advice for bullish conditions
    """
    real_signals = fetch_all_signals()
    analysis = generate_market_analysis("bullish", real_signals)
    
    return jsonify({
        "success": True,
        "sentiment": "bullish",
        **analysis
    })

@app.route("/api/connect", methods=["POST"])
def connect_telegram():
    """
    POST /api/connect
    
    Registers a user's Telegram credentials for receiving alerts.
    Users provide their username and Telegram chat_id (obtained from @userinfobot).
    
    Request Body:
        {
            "username": "john_doe",
            "chat_id": "123456789"
        }
        
    Response:
        Success/failure message with user profile
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"success": False, "error": "No JSON data provided"}), 400
    
    username = data.get("username")
    chat_id = data.get("chat_id")
    
    if not username or not chat_id:
        return jsonify({
            "success": False, 
            "error": "Both 'username' and 'chat_id' are required"
        }), 400
    
    # Load existing data and add/update user
    stored_data = load_data()
    
    if username not in stored_data["users"]:
        stored_data["users"][username] = {
            "chat_id": str(chat_id),
            "watchlist": []
        }
    else:
        stored_data["users"][username]["chat_id"] = str(chat_id)
    
    save_data(stored_data)
    
    return jsonify({
        "success": True,
        "message": f"Telegram connected for user '{username}'",
        "user": stored_data["users"][username]
    })


@app.route("/api/watchlist", methods=["POST"])
def add_to_watchlist():
    """
    POST /api/watchlist
    
    Adds a financial keyword to a user's watchlist.
    When negative sentiment signals match these keywords, users get alerted.
    
    Request Body:
        {
            "username": "john_doe",
            "keyword": "Bitcoin"
        }
        
    Response:
        Updated watchlist for the user
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"success": False, "error": "No JSON data provided"}), 400
    
    username = data.get("username")
    keyword = data.get("keyword")
    
    if not username or not keyword:
        return jsonify({
            "success": False,
            "error": "Both 'username' and 'keyword' are required"
        }), 400
    
    stored_data = load_data()
    
    # Check if user exists
    if username not in stored_data["users"]:
        return jsonify({
            "success": False,
            "error": f"User '{username}' not found. Please connect Telegram first."
        }), 404
    
    # Add keyword to watchlist (avoid duplicates, case-insensitive)
    watchlist = stored_data["users"][username]["watchlist"]
    keyword_lower = keyword.lower()
    
    if keyword_lower not in [k.lower() for k in watchlist]:
        stored_data["users"][username]["watchlist"].append(keyword)
        save_data(stored_data)
        message = f"Added '{keyword}' to watchlist"
    else:
        message = f"'{keyword}' already in watchlist"
    
    return jsonify({
        "success": True,
        "message": message,
        "watchlist": stored_data["users"][username]["watchlist"]
    })


@app.route("/api/trigger-check", methods=["POST"])
def trigger_check():
    """
    POST /api/trigger-check
    
    THE CORE ALERT ENGINE - This is the primary innovation of our Monitor110 revival.
    
    This endpoint:
    1. Scans all financial signals
    2. Identifies signals with NEGATIVE sentiment
    3. Matches negative signals against each user's watchlist keywords
    4. Sends Telegram alerts for any matches
    
    This "push" model is the key improvement over the original Monitor110,
    which required users to manually check a dashboard for updates.
    
    Response:
        Summary of alerts sent and matches found
    """
    stored_data = load_data()
    alerts_sent = 0
    matches_found = []
    
    # Fetch and analyze signals with LLM
    real_signals = fetch_all_signals()
    analyzed_signals, market_summary = analyze_signals_with_llm(real_signals)
    
    # Process signals with negative/critical sentiment
    for signal in analyzed_signals:
        sentiment = signal.get("sentiment", "Neutral")
        urgency = signal.get("urgency", "low")
        
        # Only process NEGATIVE or HIGH/CRITICAL urgency signals
        if sentiment != "Negative" and urgency not in ["critical", "high"]:
            continue
        
        signal_keywords = [k.lower() for k in signal.get("keywords", [])]
        
        # Check each user's watchlist for matches
        for username, user_data in stored_data["users"].items():
            user_watchlist = [k.lower() for k in user_data.get("watchlist", [])]
            
            # Find intersection of signal keywords and user watchlist
            matched_keywords = set(signal_keywords) & set(user_watchlist)
            
            if matched_keywords:
                # Construct enhanced alert message with AI insights
                urgency_emoji = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}.get(urgency, "⚪")
                
                alert_message = (
                    f"🚨 *ALERT: {urgency.upper()} URGENCY*\n\n"
                    f"{urgency_emoji} Urgency: {urgency.capitalize()}\n"
                    f"📰 *{signal['headline']}*\n\n"
                    f"📊 Source: {signal['source']}\n"
                    f"💹 Sentiment: {sentiment} ({signal.get('sentiment_score', 0):.2f})\n"
                    f"🔑 Matched: {', '.join(matched_keywords)}\n\n"
                    f"🤖 *AI Analysis:*\n_{signal.get('ai_analysis', 'N/A')}_\n\n"
                    f"💡 *Recommendation:* {signal.get('recommendation', 'Monitor closely')}"
                )
                
                # Send Telegram alert
                chat_id = user_data.get("chat_id")
                if chat_id:
                    success = send_telegram_alert(chat_id, alert_message)
                    if success:
                        alerts_sent += 1
                
                matches_found.append({
                    "user": username,
                    "signal_id": signal.get("id"),
                    "headline": signal["headline"],
                    "matched_keywords": list(matched_keywords),
                    "sentiment": sentiment,
                    "urgency": urgency,
                    "ai_analysis": signal.get("ai_analysis")
                })
    
    return jsonify({
        "success": True,
        "alerts_sent": alerts_sent,
        "matches_found": len(matches_found),
        "market_summary": market_summary,
        "details": matches_found
    })


# ============================================================================
# HEALTH CHECK & MAIN
# ============================================================================

@app.route("/", methods=["GET"])
def health_check():
    """Root endpoint for health checking"""
    return jsonify({
        "status": "online",
        "app": "Monitor110 Revival",
        "version": "1.0.0",
        "hackathon": "FAIL.EXE - Manipal University Jaipur",
        "endpoints": ["/api/bearish", "/api/bullish", "/api/connect", "/api/watchlist"]
    })


# ============================================================================
# BACKGROUND SCHEDULER - Auto Alert System
# ============================================================================

# Track recently sent alerts to avoid duplicates
sent_alert_cache = {}  # {user: {topic: timestamp}}

def run_scheduled_alert_check():
    """
    Background job that runs every 30 minutes to check for alerts.
    Limits to max 2 alerts per user per check.
    Uses global cache to prevent duplicate alerts for same topic within 4 hours.
    """
    global sent_alert_cache
    
    with app.app_context():
        print("\n" + "=" * 60)
        print("[SCHEDULER] Running automatic alert check...")
        print("=" * 60)
        
        try:
            stored_data = load_data()
            current_time = time.time()
            
            if not stored_data.get("users"):
                print("[SCHEDULER] No users registered, skipping check")
                return
            
            # Fetch signals (skip LLM to avoid rate limits - use VADER only)
            real_signals = fetch_all_signals()
            
            # Simple keyword-based sentiment (no LLM call)
            bearish_keywords = ["crash", "fall", "drop", "plunge", "loss", "sell-off", "collapse"]
            
            alerts_sent = 0
            
            for username, user_data in stored_data["users"].items():
                user_alerts_this_run = 0
                
                # Initialize user cache if not exists
                if username not in sent_alert_cache:
                    sent_alert_cache[username] = {}
                
                user_watchlist = [k.lower() for k in user_data.get("watchlist", [])]
                
                for signal in real_signals:
                    # Max 2 alerts per user per run
                    if user_alerts_this_run >= 2:
                        break
                    
                    headline = signal.get("headline", "").lower()
                    
                    # Check if it's a bearish signal
                    is_bearish = any(kw in headline for kw in bearish_keywords)
                    if not is_bearish:
                        continue
                    
                    # Check watchlist match
                    signal_keywords = [k.lower() for k in signal.get("keywords", [])]
                    matched_keywords = set(signal_keywords) & set(user_watchlist)
                    
                    if not matched_keywords:
                        continue
                    
                    # Deduplicate: Check if alerted recently (4 hour cooldown)
                    topic = list(matched_keywords)[0]
                    last_sent_time = sent_alert_cache[username].get(topic, 0)
                    
                    if current_time - last_sent_time < 14400:  # 4 hours in seconds
                        continue
                    
                    # Send alert
                    alert_message = (
                        f"🚨 *AUTO-ALERT*\n\n"
                        f"📰 *{signal.get('headline', 'Market Update')}*\n\n"
                        f"📊 Source: {signal.get('source', 'Unknown')}\n"
                        f"🔑 Topic: {topic}\n\n"
                        f"💡 Monitor this closely and consider your positions."
                    )
                    
                    chat_id = user_data.get("chat_id")
                    if chat_id and send_telegram_alert(chat_id, alert_message):
                        alerts_sent += 1
                        user_alerts_this_run += 1
                        # Update cache with current time
                        sent_alert_cache[username][topic] = current_time
            
            print(f"[SCHEDULER] Alert check complete. Sent {alerts_sent} alerts.")
            
        except Exception as e:
            print(f"[SCHEDULER] Error during alert check: {e}")


# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(func=run_scheduled_alert_check, trigger="interval", minutes=5, id="alert_check")


if __name__ == "__main__":
    print("=" * 60)
    print("MONITOR110 REVIVAL - Flask Backend")
    print("=" * 60)
    print(f"Telegram Bot Token: {'[OK] Configured' if TELEGRAM_BOT_TOKEN else '[X] Not set'}")
    print(f"Gemini API Key: {'[OK] Configured' if GEMINI_API_KEY else '[X] Not set'}")
    print(f"Data File: {DATA_FILE}")
    print("=" * 60)
    print("[SCHEDULER] Starting background alert checker (every 5 mins)...")
    
    # Start scheduler
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown())
    
    print("[SCHEDULER] Background scheduler running!")
    print("=" * 60)
    
    app.run(debug=True, port=5000, use_reloader=False)  # use_reloader=False to prevent double scheduler
