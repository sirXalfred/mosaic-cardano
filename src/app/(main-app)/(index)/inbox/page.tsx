import React from 'react';
import { Metadata } from 'next';
import InboxView from '@/components/notifications/InboxView';

export const metadata: Metadata = {
  title: 'Inbox',
  description: 'Your personal notification center.',
};

export default function InboxPage() {
  return <InboxView />;
}
