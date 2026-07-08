"use client";

import React, { useState, useEffect } from 'react';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';
import { CloseButton } from '../ui/close-button';
import { Button } from '../ui/button';

export interface PromptModalPayload {
  title: string;
  placeholder?: string;
  type?: 'text' | 'url' | 'number';
  defaultValue?: string;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
}

export default function PromptModal() {
  const { isOpen, closeModal, getModalData } = useModals();
  const isVisible = isOpen(MODALS.PROMPT);
  const payload = getModalData<PromptModalPayload>(MODALS.PROMPT);

  const [value, setValue] = useState('');

  useEffect(() => {
    if (isVisible && payload?.defaultValue) {
      setValue(payload.defaultValue);
    } else if (isVisible) {
      setValue('');
    }
  }, [isVisible, payload?.defaultValue]);

  if (!isVisible || !payload) return null;

  const handleClose = () => {
    if (payload.onCancel) payload.onCancel();
    closeModal(MODALS.PROMPT);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    payload.onSubmit(value.trim());
    closeModal(MODALS.PROMPT);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-theme-parchment/80 backdrop-blur-sm">
      <div className="bg-theme-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-theme-outline/20 relative animate-in zoom-in-95 duration-200">
        <CloseButton onClick={handleClose} />

        <h2 className="text-xl font-serif text-theme-forest mb-4 pr-8">
          {payload.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            autoFocus
            type={payload.type || 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={payload.placeholder || ''}
            className="w-full bg-white border border-theme-outline/20 rounded-xl px-4 py-3 text-sm text-theme-forest outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent transition-all"
          />

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!value.trim()}
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
