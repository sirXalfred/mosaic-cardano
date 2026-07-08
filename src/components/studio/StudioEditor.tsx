import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, Save, Loader2, 
  Image as ImageIcon, Link as LinkIcon, CheckCircle2, MessageSquare,
  QuoteIcon,
  MinusIcon,
  CodeIcon,
  ListIcon
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import { Markdown } from '@tiptap/markdown'
import { useCreateDocument, useUpdateDocument } from '@/services/documents';
import { saveLocalDocument, getLocalDocuments, deleteLocalDocument } from '@/lib/indexeddb';
import { DocumentDetails } from '@/types/mosaic';
import dynamic from 'next/dynamic';
import { useInviteContributor } from '@/services/documents';
import { toast } from 'sonner';
import { useModals } from '@/contexts/modals-context';
import { MODALS } from '@/lib/modals';
import { useGetAuthState } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

const SignContributionButton = dynamic(() => import('./SignContributionButton').then((m) => m.SignContributionButton), { ssr: false });

import { PublishStep } from '@/types/mosaic';

export default function StudioEditor({ 
  setPublishStep,
  documentId,
  document,
  isContentLoading,
  toggleSidebar
}: { 
  setPublishStep: (val: PublishStep) => void,
  documentId: string | null,
  document?: DocumentDetails | null,
  isContentLoading?: boolean,
  toggleSidebar?: () => void
}) {
  const { mutateAsync: createDocument, isPending: isCreating } = useCreateDocument();
  const { mutateAsync: updateDocument, isPending: isUpdating } = useUpdateDocument();
  const { mutateAsync: inviteContributor, isPending: isInviting } = useInviteContributor();
  const isSaving = isCreating || isUpdating;
  const { openModal } = useModals();
  const { data: authState } = useGetAuthState();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [currentPieceId, setCurrentPieceId] = useState<string | null>(documentId === 'new' ? null : documentId);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const isFrozen = ['freezing', 'propose', 'waiting', 'mint', 'success'].includes(document?.publishStage || '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: 'bg-theme-surface-low text-sm font-mono p-4 rounded-lg border border-theme-outline/20 my-4' } },
        blockquote: { HTMLAttributes: { class: 'border-l-4 border-theme-clay pl-4 italic my-6 text-theme-on-surface/80 bg-theme-surface-low/50 py-2' } },
        bulletList: { HTMLAttributes: { class: 'list-disc list-outside ml-6 space-y-2 my-4' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal list-outside ml-6 space-y-2 my-4' } },
      }),
      Placeholder.configure({
        placeholder: isFrozen ? '' : 'Write the next chapter of the archive...',
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount,
      Image.configure({
        HTMLAttributes: { class: 'rounded-xl shadow-md max-w-full h-auto my-8 border border-theme-outline/10' },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-theme-accent underline decoration-theme-accent/30 underline-offset-4 hover:decoration-theme-accent transition-colors' },
      }),
      Typography,
      Markdown,
    ],
    content: document?.contentRaw || '',
    editable: !isFrozen,
    editorProps: {
      attributes: {
        class: `prose prose-theme font-serif text-lg leading-loose text-theme-on-surface/90 outline-none min-h-[60vh] max-w-none pb-32 ${isFrozen ? 'opacity-75 cursor-not-allowed' : ''}`,
      },
    },
    onUpdate: async ({ editor }) => {
      setWordCount(editor.storage.characterCount.words());
      setCharCount(editor.storage.characterCount.characters());

      const targetId = currentPieceId || 'new-draft';
      try {
        await saveLocalDocument({
          id: targetId,
          title: title || 'Untitled Draft',
          contentSnippet: editor.getText().slice(0, 100),
          content: editor.getMarkdown(),
          lastAccessed: Date.now(),
        });
      } catch {
        // silently ignore
      }
    },
  });

  useEffect(() => {
    async function loadContent() {
      if (!editor) return;
      if (documentId !== 'new' && !document) return;
      
      if (document?.title) {
        setTitle(document.title);
      }
      
      let initialContent = document?.contentRaw || '';

      const targetId = documentId === 'new' ? 'new-draft' : documentId;
      if (targetId) {
        try {
          const localDocs = await getLocalDocuments();
          const localDoc = localDocs.find(d => d.id === targetId);
          // If local document was accessed/saved after the server version was last updated
          if (localDoc && localDoc.content && (targetId === 'new-draft' || localDoc.lastAccessed > (document?.updatedAt || 0))) {
            initialContent = localDoc.content;
            setLastSaved(new Date(localDoc.lastAccessed));
            console.log("Loaded newer draft from local IndexedDB");
          }
        } catch (e) {
          console.warn("Failed to check local documents", e);
        }
      }

      // Wait for editor to be ready and sync content
      if (editor.getHTML() === '<p></p>' && initialContent) {
        editor.commands.setContent(initialContent);
        setWordCount(editor.storage.characterCount.words());
        setCharCount(editor.storage.characterCount.characters());
      }
    }
    loadContent();
  }, [document, editor, documentId]);

  const handleSave = async () => {
    if (!editor) return;
    
    const loadingToast = toast.loading(currentPieceId ? "Saving changes..." : "Creating new draft...");
    
    try {
      let savedId = currentPieceId;
      if (!currentPieceId) {
        const { id: newId } = await createDocument({
          title: title || 'Untitled Draft',
          content: editor.getHTML()
        });
        setCurrentPieceId(newId);
        savedId = newId;
        await deleteLocalDocument('new-draft');
        router.replace(ROUTES.STUDIO_EDITOR(newId));
      } else {
        await updateDocument({
          documentId: currentPieceId,
          updates: { title: title || 'Untitled Draft', contentRaw: editor.getHTML() }
        });
      }
      
      setLastSaved(new Date());

      // Cache locally to IndexedDB
      if (savedId) {
        await saveLocalDocument({
          id: savedId,
          title: title || 'Untitled Draft',
          contentSnippet: editor.getText().slice(0, 100),
          content: editor.getHTML(),
          lastAccessed: Date.now(),
        });
      }
      toast.success(currentPieceId ? "Saved successfully" : "Draft created", { id: loadingToast });
    } catch (e) {
      toast.error("Failed to save draft", { id: loadingToast });
      console.error(e);
    }
  };

  const addImage = useCallback(() => {
    openModal(MODALS.PROMPT, {
      title: "Add Image",
      type: "url",
      placeholder: "URL of the image",
      onSubmit: (url: string) => {
        if (editor) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }
    });
  }, [editor, openModal]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    
    openModal(MODALS.PROMPT, {
      title: "Set Link",
      type: "url",
      placeholder: "https://...",
      defaultValue: previousUrl,
      onSubmit: (url: string) => {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      },
      onCancel: () => {
        if (!previousUrl) {
          editor.chain().focus().extendMarkRange('link').unsetLink().run();
        }
      }
    });
  }, [editor, openModal]);

  const isEditorDisabled = isSaving;

  const handleInvite = async () => {
    if (!currentPieceId) {
      toast.error("Please save the draft first");
      return;
    }
    
    openModal(MODALS.PROMPT, {
      title: "Invite Contributor",
      placeholder: "Enter username...",
      type: "text",
      onSubmit: async (username: string) => {
        await inviteContributor({ documentId: currentPieceId, username });
      }
    });
  };

  // Only show signing button if the logged-in user is a contributor with 'Pending' status and has been assigned a weight > 0
  const loggedInUserId = authState?.user?.id;
  const userContribution = document?.contributions?.find(c => c.userId === loggedInUserId);
  const needsToSign = userContribution?.status === 'Pending' && (userContribution.weight || 0) > 0;

  return (
    <main className="flex-1 flex flex-col h-full bg-theme-surface relative">
      
      {/* Streamlined Header */}
      <div className="h-16 border-b border-theme-outline/20 flex items-center justify-between px-6 bg-theme-surface/90 backdrop-blur-md z-40 sticky top-0">
        
        <div className="flex-1 flex items-center pr-6">
          <input 
            type="text"
            className="w-full bg-transparent font-serif text-xl text-theme-forest outline-none placeholder:text-theme-outline/50 truncate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Document"
          />
        </div>
        
        <div className="flex items-center gap-6">

          {/* Contributors UI */}
          <div className="hidden md:flex items-center">
            <div className="flex -space-x-2 mr-2">
              {document?.contributions && document.contributions.length > 0 ? (
                document.contributions.map((c, i) => (
                  <div key={c.userId} className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-theme-surface z-${20 - i} ${c.status === 'Signed' ? 'bg-green-500' : 'bg-theme-accent'}`} title={`${c.name} (${c.role || 'Collaborator'}) - ${c.status}`}>
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                ))
              ) : (
                <div className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-theme-surface z-20" title="You (Author)">You</div>
              )}
            </div>
            <button 
              onClick={handleInvite}
              disabled={isInviting}
              className="text-[10px] text-theme-on-surface/50 font-bold uppercase tracking-widest cursor-pointer hover:text-theme-accent disabled:opacity-50"
            >
              {isInviting ? 'Inviting...' : '+ Invite'}
            </button>
          </div>

          {/* Sign Button */}
          {needsToSign && currentPieceId && userContribution && (
            <SignContributionButton 
              documentId={currentPieceId} 
              weight={userContribution.weight} 
            />
          )}

          {/* Save Status & Button */}
          <div className="flex items-center gap-2 md:gap-3">
            {lastSaved && !isSaving && (
              <span className="hidden md:flex text-[10px] font-sans text-theme-on-surface/40 items-center gap-1">
                <CheckCircle2 size={12} /> Saved
              </span>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="text-theme-on-surface/50 hover:text-theme-forest p-1.5 cursor-pointer disabled:opacity-50 flex items-center transition-colors rounded hover:bg-theme-outline/5"
              title="Save Draft"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            </button>
          </div>
          
          <button 
            onClick={() => {
              if (isFrozen) {
                setPublishStep(document?.publishStage || 'draft');
              } else {
                setPublishStep('draft');
              }
            }}
            disabled={!currentPieceId || isSaving}
            title={!currentPieceId ? "Please save your draft first" : (isFrozen ? "Continue Publishing" : "Publish to Library")}
            className="bg-theme-forest text-theme-parchment px-4 py-1.5 md:px-5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-theme-forest/90 transition-transform active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFrozen ? `Continue: ${document?.publishStage}` : 'Publish Piece'}
          </button>
          
          {/* Mobile Sidebar Toggle */}
          <button 
            onClick={toggleSidebar}
            className="lg:hidden text-theme-on-surface/50 hover:text-theme-forest p-1.5 cursor-pointer rounded hover:bg-theme-outline/5"
            title="Toggle Sidebar"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>

      {/* Tiptap Bubble Menu */}
      {editor && (
        <BubbleMenu editor={editor} className="flex items-center bg-theme-surface-high border border-theme-outline/20 shadow-xl rounded-lg overflow-hidden p-1 gap-1 animate-in zoom-in-95">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded text-theme-forest hover:bg-theme-outline/10 ${editor.isActive('bold') ? 'bg-theme-outline/20' : ''}`}><Bold size={15} /></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded text-theme-forest hover:bg-theme-outline/10 ${editor.isActive('italic') ? 'bg-theme-outline/20' : ''}`}><Italic size={15} /></button>
          <div className="w-px h-5 bg-theme-outline/20 mx-1"></div>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded font-serif font-bold text-theme-forest hover:bg-theme-outline/10 ${editor.isActive('heading', { level: 2 }) ? 'bg-theme-outline/20' : ''}`}>H2</button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded font-serif font-bold text-theme-forest hover:bg-theme-outline/10 ${editor.isActive('heading', { level: 3 }) ? 'bg-theme-outline/20' : ''}`}>H3</button>
          <div className="w-px h-5 bg-theme-outline/20 mx-1"></div>
          <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded text-theme-forest hover:bg-theme-outline/10 ${editor.isActive('blockquote') ? 'bg-theme-outline/20' : ''}`}><QuoteIcon size={15} /></button>
          <button onClick={setLink} className={`p-2 rounded text-theme-forest hover:bg-theme-outline/10 ${editor.isActive('link') ? 'bg-theme-outline/20' : ''}`}><LinkIcon size={15} /></button>
          <div className="w-px h-5 bg-theme-outline/20 mx-1"></div>
          <button onClick={() => {}} className="p-2 rounded text-theme-accent hover:bg-theme-outline/10" title="Add Inline Comment"><MessageSquare size={15} /></button>
        </BubbleMenu>
      )}

      {/* Tiptap Floating Menu */}
      {editor && (
        <FloatingMenu editor={editor} className="flex items-center gap-1">
          <div className="bg-theme-surface-high border border-theme-outline/20 shadow-lg rounded-full flex items-center p-1 px-2 gap-2 animate-in slide-in-from-right-2">
            <button onClick={addImage} className="p-1.5 rounded-full text-theme-forest hover:bg-theme-outline/10 transition-colors" title="Add Image"><ImageIcon size={16} /></button>
            <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="p-1.5 rounded-full text-theme-forest hover:bg-theme-outline/10 transition-colors" title="Add Divider"><MinusIcon size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="p-1.5 rounded-full text-theme-forest hover:bg-theme-outline/10 transition-colors" title="Code Block"><CodeIcon size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-1.5 rounded-full text-theme-forest hover:bg-theme-outline/10 transition-colors" title="Bullet List"><ListIcon size={16} /></button>
          </div>
        </FloatingMenu>
      )}

      {/* Editor Content Area */}
      <div className={`flex-1 overflow-y-auto relative ${isEditorDisabled ? 'opacity-70 pointer-events-none' : ''}`}>
        <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
          {(!editor || isContentLoading) ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-theme-accent opacity-50" size={32} />
            </div>
          ) : (
            <div className="tiptap-wrapper">
              <EditorContent editor={editor} />
            </div>
          )}
        </div>
      </div>
      
      {editor && (
        <div className="absolute bottom-6 right-6 flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/40 pointer-events-none">
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      )}

      {/* Tiptap Styles to hide generic outlines, handle placeholder, and match theme */}
      <style dangerouslySetInnerHTML={{__html: `
        .tiptap-wrapper .ProseMirror {
          outline: none !important;
        }
        
        .tiptap-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(var(--color-theme-outline-rgb), 0.5);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }

        .tiptap-wrapper .ProseMirror h1 {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          color: var(--color-theme-forest);
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .tiptap-wrapper .ProseMirror h2 {
          font-family: var(--font-serif);
          font-size: 2rem;
          color: var(--color-theme-forest);
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .tiptap-wrapper .ProseMirror h3 {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          color: var(--color-theme-forest);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .tiptap-wrapper .ProseMirror hr {
          border: none;
          border-top: 1px solid rgba(var(--color-theme-outline-rgb), 0.2);
          margin: 3rem 0;
        }

        .tiptap-wrapper .ProseMirror p {
          margin-bottom: 1.5rem;
        }
      `}} />
    </main>
  );
}
