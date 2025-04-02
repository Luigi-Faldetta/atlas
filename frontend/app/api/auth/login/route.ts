import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Simple validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // For mock/development purposes, consider any login valid
    // In a real app, you would verify credentials against a database
    const mockUser = {
      id: '1',
      name: 'Demo User',
      email: email,
    };

    // Generate a mock JWT token (in a real app, use a proper JWT library)
    const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);

    return NextResponse.json({
      success: true,
      user: mockUser,
      token: mockToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 