'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Radio } from 'lucide-react';

export default function AdminBroadcastPage() {
  const [audience, setAudience] = useState('ALL');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience,
          title,
          body,
          actionUrl: actionUrl || undefined
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Broadcast failed');
      }

      const data = await res.json();
      setStatus('success');
      setMessage(`Successfully sent broadcast to ${data.sentCount} users!`);
      setTitle('');
      setBody('');
      setActionUrl('');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-onrender --fade-in">
      <header className="flex justify-between items-center bg-theme-surface-high p-6 rounded-2xl border border-theme-outline/10 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif font-bold text-theme-forest flex items-center gap-2">
            <Radio size={24} className="text-theme-accent" />
            Broadcast Engine
          </h2>
          <p className="text-theme-on-surface/60 mt-1">Send immediate in-app and push notifications to user segments.</p>
        </div>
      </header>

      <form onSubmit={handleBroadcast} className="bg-theme-surface-high p-6 rounded-2xl border border-theme-outline/10 shadow-sm space-y-6">
        
        {status === 'success' && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-bold text-sm">
            {message}
          </div>
        )}
        
        {status === 'error' && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-bold text-sm">
            {message}
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-bold text-theme-forest uppercase tracking-widest">Target Audience</label>
          <select 
            value={audience} 
            onChange={e => setAudience(e.target.value)}
            className="w-full p-3 bg-theme-surface-low border border-theme-outline/20 rounded-xl focus:outline-none focus:border-theme-accent text-sm"
          >
            <option value="ALL">All Users</option>
            <option value="FREE">FREE Plan Users Only</option>
            <option value="BASIC">BASIC Plan Users Only</option>
            <option value="PRO">PRO Plan Users Only</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-theme-forest uppercase tracking-widest">Notification Title</label>
          <input 
            type="text" 
            required
            maxLength={140}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Platform Update: New Studio Features!"
            className="w-full p-3 bg-theme-surface-low border border-theme-outline/20 rounded-xl focus:outline-none focus:border-theme-accent text-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-theme-forest uppercase tracking-widest">Message Body</label>
          <textarea 
            required
            maxLength={1000}
            rows={4}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Type your message here..."
            className="w-full p-3 bg-theme-surface-low border border-theme-outline/20 rounded-xl focus:outline-none focus:border-theme-accent text-sm resize-none"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-theme-forest uppercase tracking-widest">Action URL <span className="text-theme-on-surface/40 normal-case tracking-normal">(Optional)</span></label>
          <input 
            type="url" 
            value={actionUrl}
            onChange={e => setActionUrl(e.target.value)}
            placeholder="e.g. https://mosaic.app/updates"
            className="w-full p-3 bg-theme-surface-low border border-theme-outline/20 rounded-xl focus:outline-none focus:border-theme-accent text-sm"
          />
        </div>

        <div className="pt-4 border-t border-theme-outline/10 flex justify-end">
          <Button 
            type="submit" 
            disabled={status === 'sending' || !title || !body}
            className="bg-theme-accent hover:bg-theme-accent/90 text-white font-bold px-8"
          >
            {status === 'sending' ? 'Transmitting...' : 'Send Broadcast'}
          </Button>
        </div>
      </form>
    </div>
  );
}
