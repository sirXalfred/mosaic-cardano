import { NextResponse } from 'next/server';
import { driver } from '@/lib/backend/neo4j';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getAuthSessionByToken } from '@/lib/backend/session';
import { badgeService } from '@/services/backend/badge.service';
import { notificationQueue } from '@/lib/queue';

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

    // Save to DB synchronously
    await saveToDb();

    // Enqueue email & notification task to background queue (non-blocking)
    notificationQueue.add('send-feedback-notification', {
      feedbackId,
      feedbackType: type,
      feedbackText: message,
      name,
      email,
      submitterId: session?.userId || 'anonymous',
    }).catch((err) => console.error('Failed to enqueue feedback notification job:', err));

    if (session && name && email) {
      badgeService.createUnclaimedBadge(session.userId, 'first-feedback', `ff-${session.userId}`).catch(console.error);
    }

    return NextResponse.json({ success: true, id: feedbackId });
  } catch (error) {
    console.error('Failed to process feedback:', error);
    return NextResponse.json({ error: 'Failed to process feedback' }, { status: 500 });
  }
}
