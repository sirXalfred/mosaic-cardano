import React, { useState } from 'react';
import { MessageSquare, Users, UserPlus, Loader2, ChevronRight } from 'lucide-react';
import { DocumentComment } from '@/services/projects';
import { useInviteContributor, useAddDocumentComment } from '@/services/documents';
import { DocumentDetails } from '@/types/mosaic';
import { useAuth } from '@/contexts/auth-context';
import dynamic from 'next/dynamic';

const SignContributionButton = dynamic(() => import('./SignContributionButton').then((m) => m.SignContributionButton), { ssr: false });


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
  const [newComment, setNewComment] = useState('');

  const { userId } = useAuth();
  const { mutateAsync: inviteUser, isPending: isInviting } = useInviteContributor();
  const { mutateAsync: addComment, isPending: isAddingComment } = useAddDocumentComment();

  const isCreator = document?.creator?.id === userId;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !document) return;
    try {
      await addComment({ documentId: document.id, content: newComment.trim() });
      setNewComment('');
    } catch {
      // toast is handled in the hook
    }
  };

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
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 flex flex-col h-full">
            <h3 className="font-sans text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/50 mb-2">Inline Comments</h3>

            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {
                !document ? (
                  <div className="text-center py-6 px-4 bg-white border border-theme-outline/10 rounded-xl shadow-sm text-theme-on-surface/50 text-xs">
                    Save the initial draft first to be able to comment!
                  </div>

                ) : <>
                  {comments?.length === 0 && (
                    <div className="text-center py-6 px-4 bg-white border border-theme-outline/10 rounded-xl shadow-sm text-theme-on-surface/50 text-xs">
                      No comments yet. Start the discussion!
                    </div>
                  )}
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
                </>
              }
            </div>

            {document && (
              <form onSubmit={handleAddComment} className="pt-4 border-t border-theme-outline/10 mt-auto">
                <div className="flex flex-col gap-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-white border border-theme-outline/20 rounded-lg px-3 py-2 text-sm text-theme-forest outline-none focus:border-theme-accent/50 resize-none min-h-[80px]"
                  />
                  <button
                    type="submit"
                    disabled={isAddingComment || !newComment.trim()}
                    className="bg-theme-forest text-theme-parchment py-2 rounded-lg cursor-pointer hover:bg-theme-forest/90 disabled:opacity-50 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {isAddingComment ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                    Post Comment
                  </button>
                </div>
              </form>
            )}
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

            {
              !document ? (
                <div className="text-center py-6 px-4 bg-white border border-theme-outline/10 rounded-xl shadow-sm text-theme-on-surface/50 text-xs">
                  Save the initial draft first to add collaborators!
                </div>
              ) : (

                <div>
                  <h3 className="font-sans text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/50 mb-4">Contributors</h3>
                  <div className="space-y-3">
                    {document?.contributions?.length === 0 && (
                      <div className="text-center py-6 px-4 bg-white border border-theme-outline/10 rounded-xl shadow-sm text-theme-on-surface/50 text-xs">
                        No collaborators yet. {isCreator ? 'Invite someone to get started!' : ''}
                      </div>
                    )}
                    {document?.contributions?.map(c => {
                      const isCurrentUser = c.userId === userId;
                      const needsSignature = c.status !== 'Signed' && isCurrentUser;

                      return (
                        <div key={c.id} className={`flex flex-col gap-3 p-3 bg-white rounded-lg border shadow-sm transition-all duration-300 ${c.status === 'Signed' ? 'border-theme-forest/30 bg-theme-forest/5' : 'border-theme-outline/10'} ${needsSignature ? 'animate-pulse border-theme-accent/50' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-theme-forest text-theme-parchment flex items-center justify-center text-xs font-bold uppercase shrink-0">
                                {c.name.substring(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-theme-forest truncate pr-2">{c.name} {isCurrentUser && '(You)'}</div>
                                <div className="text-[10px] text-theme-on-surface/50 uppercase tracking-wider truncate">{c.role} {c.weight > 0 ? `• ${c.weight}%` : ''}</div>
                              </div>
                            </div>
                            <div className="shrink-0 ml-2">
                              <span className={`text-[10px] px-2 py-1 rounded-full border ${c.status === 'Signed' ? 'border-theme-forest text-theme-forest bg-theme-forest/10' : 'border-theme-accent text-theme-accent bg-theme-accent/10'}`}>
                                {c.status}
                              </span>
                            </div>
                          </div>
                          {needsSignature && (
                            <div className="mt-1 flex justify-end">
                              <SignContributionButton documentId={document.id} weight={c.weight} className="w-full justify-center" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }

          </div>
        )}
      </div>
    </aside>
  );
}
