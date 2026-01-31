import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, chat_id } = body;

    // TODO: Save to your actual database here
    console.log(`Connecting user: ${username} with Chat ID: ${chat_id}`);

    // Mock response mimicking a real database return
    return NextResponse.json({
      success: true,
      message: `Telegram connected for user '${username}'`,
      user: {
        username,
        chat_id,
        watchlist: ["Bitcoin", "Ethereum"] // Mock existing data
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
}