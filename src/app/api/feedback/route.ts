import { NextResponse } from 'next/server';
import { driver } from '@/lib/backend/neo4j';
import { Resend } from 'resend';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getAuthSessionByToken } from '@/lib/backend/session';
import { badgeService } from '@/services/backend/badge.service';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type: feedbackType, message, name, email } = body;
    const type = feedbackType.toLowerCase();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const feedbackId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const cookieStore = await cookies();
    const token = cookieStore.get('mosaic_session')?.value;
    let session = null;
    if (token) {
      session = await getAuthSessionByToken(token);
    }

    const saveToDb = async () => {
      const session = driver.session();
      try {
        await session.executeWrite((tx) =>
          tx.run(
            `
            CREATE (f:Feedback {
              id: $id,
              type: $type,
              message: $message,
              name: $name,
              email: $email,
              createdAt: $createdAt
            })
            RETURN f
            `,
            { id: feedbackId, type, message, name: name || null, email: email || null, createdAt }
          )
        );
      } finally {
        await session.close();
      }
    };

    const sendEmail = async () => {
      const toEmail = process.env.RESEND_TO_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_MAIL;
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      
      if (!resend || !toEmail || !fromEmail) {
        console.warn('RESEND environment not fully configured, skipping email.');
        return;
      }      

      await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        subject: `Mosaic Feedback - ${type}`,
        html: `
          <h1>New feedback received!</h1>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Name:</strong> ${name || 'Anonymous'}</p>
          <p><strong>Email:</strong> ${email || 'Anonymous'}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>ID:</strong> ${feedbackId}</p>
          ${email ? `<a href="mailto:${email}?subject=Reply to Mosaic feedback&body=Hi ${name}, ${type === 'bug' ? 'we are sorry to hear that you are experiencing issues with our platform. ' : 'we appreciate your feedback.'} we have received your feedback with ID: ${feedbackId} and will get back to you as soon as possible.">Reply to this feedback</a>` : ''}
        `,
      });
    };

    // Execute both tasks concurrently
    await Promise.allSettled([saveToDb(), sendEmail()]);

    if (session && name && email) {
      badgeService.createUnclaimedBadge(session.userId, 'first-feedback', `ff-${session.userId}`).catch(console.error);
    }

    return NextResponse.json({ success: true, id: feedbackId });
  } catch (error) {
    console.error('Failed to process feedback:', error);
    return NextResponse.json({ error: 'Failed to process feedback' }, { status: 500 });
  }
}
