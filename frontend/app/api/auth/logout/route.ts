import { NextResponse } from 'next/server';

export async function POST() {
  // In a real app, you would invalidate the JWT token or session
  // For mock purposes, we'll just return a success response
  
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });
} 