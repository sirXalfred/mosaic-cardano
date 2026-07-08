"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ModalId } from '@/lib/modals';

interface ModalsContextType {
  openModal: <T = unknown>(modalId: ModalId, payload?: T) => void;
  closeModal: (modalId: ModalId) => void;
  isOpen: (modalId: ModalId) => boolean;
  getModalData: <T = unknown>(modalId: ModalId) => T | undefined;
}

const ModalsContext = createContext<ModalsContextType | null>(null);

export const ModalsProvider = ({ children }: { children: ReactNode }) => {
  const [modalsState, setModalsState] = useState<Record<string, { isOpen: boolean; payload?: unknown }>>({});

  const openModal = useCallback(<T = unknown>(modalId: ModalId, payload?: T) => {
    setModalsState((prev) => ({ ...prev, [modalId]: { isOpen: true, payload } }));
  }, []);

  const closeModal = useCallback((modalId: ModalId) => {
    setModalsState((prev) => ({ ...prev, [modalId]: { isOpen: false } }));
  }, []);

  const isOpen = useCallback((modalId: ModalId) => {
    return !!modalsState[modalId]?.isOpen;
  }, [modalsState]);

  const getModalData = useCallback(<T = unknown>(modalId: ModalId): T | undefined => {
    return modalsState[modalId]?.payload as T | undefined;
  }, [modalsState]);

  return (
    <ModalsContext.Provider value={{ openModal, closeModal, isOpen, getModalData }}>
      {children}
    </ModalsContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalsContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalsProvider');
  }
  return context;
};
