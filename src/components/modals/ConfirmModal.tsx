"use client";

import React, { useState } from 'react';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';
import { CloseButton } from '../ui/close-button';
import { Button } from '../ui/button';
import { AlertTriangle, Trash2, HelpCircle, Loader2 } from 'lucide-react';

export interface ConfirmModalPayload {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export default function ConfirmModal() {
  const { isOpen, closeModal, getModalData } = useModals();
  const isVisible = isOpen(MODALS.CONFIRM);
  const payload = getModalData<ConfirmModalPayload>(MODALS.CONFIRM);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isVisible || !payload) return null;

  const variant = payload.variant || 'danger';
  const confirmText = payload.confirmText || (variant === 'danger' ? 'Delete' : 'Confirm');
  const cancelText = payload.cancelText || 'Cancel';

  const handleClose = () => {
    if (isSubmitting) return;
    if (payload.onCancel) payload.onCancel();
    closeModal(MODALS.CONFIRM);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await payload.onConfirm();
      closeModal(MODALS.CONFIRM);
    } catch (err) {
      console.error('Confirmation action failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-theme-parchment/80 backdrop-blur-sm">
      <div className="bg-theme-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-theme-outline/20 relative animate-in zoom-in-95 duration-200">
        <CloseButton onClick={handleClose} />

        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              variant === 'danger'
                ? 'bg-red-500/10 text-red-600'
                : variant === 'warning'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-theme-forest/10 text-theme-forest'
            }`}
          >
            {variant === 'danger' ? (
              <Trash2 className="w-5 h-5" />
            ) : variant === 'warning' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <HelpCircle className="w-5 h-5" />
            )}
          </div>

          <h2 className="text-lg font-serif font-bold text-theme-forest pr-6">
            {payload.title}
          </h2>
        </div>

        {payload.description && (
          <p className="text-sm text-theme-on-surface/70 mb-6 leading-relaxed">
            {payload.description}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex-1 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white border-transparent'
                : ''
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
