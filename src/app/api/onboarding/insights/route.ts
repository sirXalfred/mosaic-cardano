import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const STOPWORDS = new Set([
  'the','and','a','an','of','in','on','for','with','to','from','by','is','are','was','were','this','that','it','as','at','be','or','which'
]);

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string') return NextResponse.json({ error: 'Missing text' }, { status: 400 });

    const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).filter(t => !STOPWORDS.has(t));
    const freq: Record<string, number> = {};
    for (const t of tokens) freq[t] = (freq[t] || 0) + 1;

    const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 12).map(([k]) => k);

    const skills = sorted.slice(0,6);
    const topics = sorted.slice(6,12);

    return NextResponse.json({ skills, topics });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Insights failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
