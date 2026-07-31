import { NextResponse } from 'next/server';
import { notificationQueue, systemQueue } from '@/lib/queue';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'feedback';

  let job;

  if (type === 'system') {
    job = await systemQueue.add('cleanup-expired-sessions', {
      triggeredBy: 'dev-test-route',
      enqueuedAt: new Date().toISOString(),
    });
  } else {
    job = await notificationQueue.add('send-feedback-notification', {
      feedbackId: 'test-' + crypto.randomUUID().slice(0, 8),
      feedbackType: 'general',
      feedbackText: 'This is a test feedback message submitted via /api/dev/test-queue.',
      name: 'Test Submitter',
      email: 'test@example.com',
      submitterId: 'test-user-id',
    });
  }

  const durationMs = Date.now() - startTime;

  return NextResponse.json({
    status: 'success',
    message: `Enqueued production job '${job.name}' into ${type === 'system' ? 'systemQueue' : 'notificationQueue'}.`,
    httpResponseDurationMs: `${durationMs}ms`,
    jobId: job.id,
  });
}

export async function POST(request: Request) {
  const startTime = Date.now();
  const body = await request.json().catch(() => ({}));

  const job = await notificationQueue.add('send-feedback-notification', {
    feedbackId: crypto.randomUUID(),
    feedbackType: body.type || 'bug',
    feedbackText: body.message || 'Feedback message submitted via POST test-queue endpoint.',
    name: body.name || 'Anonymous User',
    email: body.email || 'user@example.com',
    submitterId: body.userId || 'anonymous-user',
  });

  const durationMs = Date.now() - startTime;

  return NextResponse.json({
    status: 'success',
    httpResponseDurationMs: `${durationMs}ms`,
    job: {
      id: job.id,
      name: job.name,
    },
  });
}
