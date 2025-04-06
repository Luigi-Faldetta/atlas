import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Simple validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // For mock/development purposes, consider any registration valid
    // In a real app, you would store user data in a database
    const mockUser = {
      id: 'user-' + Math.random().toString(36).substring(2),
      name: name,
      email: email,
    };

    // Generate a mock JWT token
    const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);

    return NextResponse.json({
      success: true,
      user: mockUser,
      token: mockToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 