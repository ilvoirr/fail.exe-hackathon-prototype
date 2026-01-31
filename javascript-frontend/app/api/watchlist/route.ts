import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, keyword } = body;

    // TODO: Add keyword to database for this user
    console.log(`User ${username} added keyword: ${keyword}`);

    // Mock response returning updated watchlist
    return NextResponse.json({
      success: true,
      message: `Added '${keyword}' to watchlist`,
      watchlist: ["Bitcoin", "Ethereum", keyword] // Echoing back with new keyword
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
}