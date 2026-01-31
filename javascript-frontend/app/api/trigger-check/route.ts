import { NextResponse } from 'next/server';

export async function POST() {
  // TODO: Trigger your actual bot logic / scraper here
  console.log("Manual trigger initiated...");
  
  return NextResponse.json({
    success: true,
    message: "Manual check triggered successfully"
  });
}