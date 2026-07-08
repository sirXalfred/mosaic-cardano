import React, { useState } from 'react';
import { MessageSquare, Users, UserPlus, Loader2, ChevronRight } from 'lucide-react';
import { DocumentComment } from '@/services/projects';
import { useInviteContributor } from '@/services/documents';
import { DocumentDetails } from '@/types/mosaic';
import { useAuth } from '@/contexts/auth-context';

export default function StudioSidebarRight({ 
  comments,
  document,
  isMobileOpen = false,
  closeMobileSidebar
}: {
  comments: DocumentComment[] | undefined;
  document: DocumentDetails | null;
  isMobileOpen?: boolean;
  closeMobileSidebar?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'comments' | 'contributors'>('contributors');
  const [inviteUsername, setInviteUsername] = useState('');
  
  const { userId } = useAuth();
  const { mutateAsync: inviteUser, isPending: isInviting } = useInviteContributor();

  const isCreator = document?.creator?.id === userId;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim() || !document) return;
    try {
      await inviteUser({ documentId: document.id, username: inviteUsername.trim() });
      setInviteUsername('');
    } catch {
      // toast is handled in the hook
    }
  };

  return (
    <aside className={`
      w-80 border-l border-theme-outline/20 bg-theme-surface-low flex flex-col 
      fixed lg:relative inset-y-0 right-0 z-50 lg:z-auto transition-transform duration-300 ease-in-out
      ${isMobileOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
    `}>
      <div className="flex border-b border-theme-outline/20 relative">
        {isMobileOpen && (
          <button 
            onClick={closeMobileSidebar}
            className="absolute -left-12 top-4 bg-theme-surface border border-theme-outline/20 p-2 rounded-l-lg lg:hidden"
          >
            <ChevronRight size={18} />
          </button>
        )}
        <button 
          onClick={() => setActiveTab('contributors')}
          className={`flex-1 py-4 flex justify-center border-b-2 ${activeTab === 'contributors' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-on-surface/50 hover:text-theme-forest cursor-pointer'}`}
          title="Contributors"
        >
          <Users size={18} />
        </button>
        <button 
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-4 flex justify-center border-b-2 ${activeTab === 'comments' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-on-surface/50 hover:text-theme-forest cursor-pointer'}`}
          title="Comments"
        >
          <MessageSquare size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'comments' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="font-sans text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/50 mb-4">Inline Comments</h3>
            {comments?.map(comment => (
              <div key={comment.id} className={`p-4 rounded-xl border text-sm ${comment.resolved ? 'bg-theme-surface opacity-60 border-theme-outline/10' : 'bg-white border-theme-clay/30 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-theme-forest">{comment.authorName}</span>
                  <span className="text-[10px] text-theme-on-surface/50">{comment.timestamp}</span>
                </div>
                <p className="text-theme-on-surface/80 mb-3">{comment.content}</p>
                <div className="flex gap-3 pt-3 border-t border-theme-outline/10">
                  {!comment.resolved && <button className="text-[10px] font-bold uppercase tracking-widest text-theme-accent hover:underline cursor-pointer">Resolve</button>}
                  <button className="text-[10px] font-bold uppercase tracking-widest text-theme-on-surface/50 hover:text-theme-forest cursor-pointer">Reply</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contributors' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            
            {isCreator && (
              <form onSubmit={handleInvite} className="mb-6">
                <h3 className="font-sans text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/50 mb-2">Invite Collaborator</h3>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    placeholder="Enter username" 
                    className="flex-1 bg-white border border-theme-outline/20 rounded-lg px-3 py-2 text-sm text-theme-forest outline-none focus:border-theme-accent/50"
                  />
                  <button 
                    type="submit" 
                    disabled={isInviting || !inviteUsername.trim()}
                    className="bg-theme-accent text-white p-2 rounded-lg cursor-pointer hover:bg-theme-accent/90 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isInviting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  </button>
                </div>
              </form>
            )}

            <div>
              <h3 className="font-sans text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/50 mb-4">Contributors</h3>
              <div className="space-y-3">
                {document?.contributions?.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-theme-outline/10 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-theme-forest text-theme-parchment flex items-center justify-center text-xs font-bold uppercase">
                        {c.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-theme-forest">{c.name}</div>
                        <div className="text-[10px] text-theme-on-surface/50 uppercase tracking-wider">{c.role} {c.weight > 0 ? `• ${c.weight}%` : ''}</div>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${c.status === 'Signed' ? 'border-theme-forest text-theme-forest bg-theme-forest/10' : 'border-theme-accent text-theme-accent bg-theme-accent/10'}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </aside>
  );
}
