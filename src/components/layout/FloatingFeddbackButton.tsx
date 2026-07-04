"use client";

import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { MessageSquare } from "lucide-react";
import { MODALS } from "@/lib/modals";
import { useModals } from "@/contexts/modals-context";

export function FloatingFeedbackButton() {
  const { openModal } = useModals();

  if (typeof window === "undefined") return null;

  return createPortal(
    <Button
      onClick={() => openModal(MODALS.FEEDBACK)}
      className="fixed bottom-6 right-6 z-[60] shadow-2xl rounded-full hover:-translate-y-1 transition-transform"
    >
      <MessageSquare size={20} />
      <span className="font-sans text-sm font-bold tracking-wider">Feedback</span>
    </Button>,
    document.body
  );
}