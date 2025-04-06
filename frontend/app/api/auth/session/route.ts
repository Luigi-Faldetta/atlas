import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // In a real app, you would verify the JWT token from cookies/headers
    // For mock purposes, we'll just return a valid session if the Authorization header exists
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Mock user data - in a real app, you would decode the JWT and get user info
      return NextResponse.json({
        user: {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
        },
        isAuthenticated: true
      });
    }
    
    // No valid token found
    return NextResponse.json({ 
      isAuthenticated: false 
    });
    
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { 
        isAuthenticated: false,
        error: 'Failed to verify session'
      },
      { status: 500 }
    );
  }
} 