import React from 'react';
import Link from 'next/link';
import { NotificationNode } from '@/types/schemas';
import { useMarkNotificationRead } from '@/services/notifications';
import { 
  Bell, 
  UserPlus, 
  AtSign, 
  FileText, 
  PenTool, 
  Megaphone, 
  Award, 
  Users 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: NotificationNode['type']) => {
  switch (type) {
    case 'UPVOTE': return <Award size={18} className="text-green-500" />;
    case 'MENTION': return <AtSign size={18} className="text-blue-500" />;
    case 'FOLLOW': return <UserPlus size={18} className="text-theme-accent" />;
    case 'SIGNATURE_REQUEST': return <PenTool size={18} className="text-purple-500" />;
    case 'VILLAGE_ANNOUNCEMENT': return <Megaphone size={18} className="text-orange-500" />;
    case 'COMMUNITY_MEMBER_JOINED': return <Users size={18} className="text-blue-600" />;
    case 'PIECE_UPDATE': return <FileText size={18} className="text-theme-forest" />;
    case 'PROJECT_UPDATE': return <FileText size={18} className="text-theme-forest" />;
    default: return <Bell size={18} className="text-theme-on-surface/50" />;
  }
};

export default function NotificationItem({ notification, onClick }: { notification: NotificationNode, onClick?: () => void }) {
  const { mutate: markAsRead } = useMarkNotificationRead();

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (onClick) onClick();
  };

  const innerContent = (
    <>
      <div className="mt-1 shrink-0 bg-white p-2 rounded-full border border-theme-outline/10 shadow-sm">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm ${!notification.isRead ? 'font-bold text-theme-forest' : 'font-medium text-theme-on-surface/80'}`}>
          {notification.title}
        </h4>
        {notification.body && (
          <p className="text-xs text-theme-on-surface/60 mt-1 line-clamp-2">
            {notification.body}
          </p>
        )}
        <span className="text-[10px] text-theme-on-surface/40 mt-2 block font-mono uppercase tracking-widest">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </span>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-theme-accent shrink-0 mt-2" />
      )}
    </>
  );

  const className = `flex items-start gap-4 p-4 hover:bg-theme-surface-low transition-colors ${!notification.isRead ? 'bg-theme-clay/5' : ''}`;

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} onClick={handleClick} className={className}>
        {innerContent}
      </Link>
    );
  }

  return (
    <div onClick={handleClick} className={className + " cursor-pointer"}>
      {innerContent}
    </div>
  );
}
