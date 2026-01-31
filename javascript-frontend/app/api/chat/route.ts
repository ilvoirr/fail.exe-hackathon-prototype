import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    // Increased to ~2500 chars to allow for structured analysis/lists
    const MAX_CHARS = 2500; 
    // Increased tokens to ~750 to match the character limit buffer
    const maxTokens = 750;

    const baseSystemPrompt = {
      role: "system",
      content: `You are a logical Finance Advisor. Your responses must be based on objective analysis, risk assessment, and quantitative logic. 
      Avoid vague emotional advice; focus on market principles, asset allocation, and data-driven insights.
      
      CRITICAL: Never reply with more than ${MAX_CHARS} characters. If you reach this limit, stop your answer immediately.`
    };

    const { messages } = await req.json()
    const modMessages = [baseSystemPrompt, ...messages];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: modMessages,
        temperature: 0.5, // Slightly lowered for more consistent, logical "advisor" tone
        max_tokens: maxTokens,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('groq api error:', error)
      return new NextResponse('failed to get response from groq', { status: response.status })
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('error in chat route:', error)
    return new NextResponse('internal server error', { status: 500 })
  }
}