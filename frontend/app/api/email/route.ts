import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    const data = await resend.emails.send({
      from: 'Atlas <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Atlas Waitlist!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">Welcome to Atlas, ${name}! 🎉</h2>
          <p>Thank you for joining our waitlist. We're excited to have you on board!</p>
          <p>We'll keep you updated on our progress and let you know as soon as we launch.</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
            <p style="margin: 0; color: #4b5563;">Stay tuned for:</p>
            <ul style="color: #4b5563;">
              <li>Early access opportunities</li>
              <li>Exclusive investment insights</li>
              <li>Platform updates</li>
            </ul>
          </div>
          <p>If you have any questions, feel free to reach out to our team.</p>
          <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The Atlas Team</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
