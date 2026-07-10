"use client";
import React from 'react';
import Link from 'next/link';
import { useGetPendingSignatures } from '@/services/home';
import { PenTool, ArrowRight } from 'lucide-react';
import { StatePanel } from '@/components/ui/StatePanel';

export default function PendingSignatures() {
  const { data: items, isLoading, isError, error, refetch } = useGetPendingSignatures();

  if (isLoading) {
    return <StatePanel variant="loading" title="Checking signatures" description="Finding documents that need your signature." className="mb-12" />;
  }

  if (isError) {
    return (
      <StatePanel
        variant="error"
        title="Could not load pending signatures"
        description="Something went wrong while fetching documents."
        errorMessage={error instanceof Error ? error.message : 'Failed to load signatures.'}
        onRetry={() => void refetch()}
        className="mb-12"
      />
    );
  }

  if (!items || items.length === 0) {
    return (
      <StatePanel
        variant="empty"
        title="No pending signatures"
        description="You do not have any documents waiting for your signature at this time."
        className="mb-12"
      />
    );
  }

  return (
    <div className="mb-12">
      <h2 className="font-serif text-xl font-medium text-theme-forest mb-4 flex items-center gap-2">
        Pending Signatures
        <span className="bg-theme-accent text-white text-[10px] px-2 py-0.5 rounded-full font-sans tracking-widest">{items.length}</span>
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <Link href={item.link} key={item.id}>
            <div className="h-full bg-theme-surface-low border border-theme-outline/30 p-4 rounded-xl hover:border-theme-clay transition-colors flex items-start justify-between group cursor-pointer shadow-sm">
              <div className="flex items-start gap-4">
                <div className="mt-1 text-theme-accent bg-theme-accent/10 p-2 rounded-lg">
                  <PenTool size={18} />
                </div>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-theme-on-surface/60 mb-1">{item.community}</p>
                  <h3 className="font-bold text-theme-forest text-sm mb-1 group-hover:text-theme-accent transition-colors">{item.title}</h3>
                  <p className="text-theme-on-surface/80 text-xs">This document is waiting for your cryptographic signature to proceed to publishing.</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-theme-outline group-hover:text-theme-accent transition-colors mt-2" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
