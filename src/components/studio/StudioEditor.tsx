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
import { useCreateArtifact, useUpdateArtifact } from '@/services/projects';

export default function StudioEditor({ 
  setPublishStep,
  projectId,
  artifactId
}: { 
  setPublishStep: (val: 'draft') => void,
  projectId: string,
  artifactId: string | null,
}) {
  const { mutateAsync: createArtifact, isPending: isCreating } = useCreateArtifact();
  const { mutateAsync: updateArtifact, isPending: isUpdating } = useUpdateArtifact();
  const isSaving = isCreating || isUpdating;
  
  const [title, setTitle] = useState('');
  const [currentArtifactId, setCurrentArtifactId] = useState<string | null>(artifactId);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
        placeholder: 'Write the next chapter of the archive...',
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
    ],
    content: artifactId ? `
      <p>The translation of the Songhai lineage records requires a careful balance between literal meaning and poetic rhythm.</p>
      <p>The original chants were performed by the Griots during the harvest festival, accompanied by the slow beating of the talking drum.</p>
      <blockquote>"The river does not forget its source, nor does the tree forget its roots."</blockquote>
    ` : '',
    editorProps: {
      attributes: {
        class: 'prose prose-theme font-serif text-lg leading-loose text-theme-on-surface/90 outline-none min-h-[60vh] max-w-none pb-32',
      },
    },
  });

  useEffect(() => {
    if (artifactId) {
      setTitle('Songhai Lineage Translation Draft');
    }
  }, [artifactId]);

  const handleSave = async () => {
    if (!editor) return;
    
    try {
      if (!currentArtifactId) {
        const newId = await createArtifact({
          projectId,
          title: title || 'Untitled Draft',
          content: editor.getHTML()
        });
        setCurrentArtifactId(newId);
        setLastSaved(new Date());
      } else {
        await updateArtifact({
          projectId,
          artifactId: currentArtifactId,
          updates: { title: title || 'Untitled Draft' }
        });
        setLastSaved(new Date());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addImage = useCallback(() => {
    const url = window.prompt('URL of the image:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const isEditorDisabled = isSaving;

  if (!editor) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-theme-accent" /></div>;
  }

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

          {/* Save Status & Button */}
          <div className="flex items-center gap-3">
            {lastSaved && !isSaving && (
              <span className="text-[10px] font-sans text-theme-on-surface/40 flex items-center gap-1">
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
            onClick={() => setPublishStep('draft')}
            disabled={!currentArtifactId || isSaving}
            title={!currentArtifactId ? "Save as draft first" : "Publish to Library"}
            className="bg-theme-forest text-theme-parchment px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-theme-forest/90 transition-transform active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publish
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
          
          <div className="tiptap-wrapper">
            <EditorContent editor={editor} />
          </div>

        </div>
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-6 right-6 flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-theme-on-surface/40 pointer-events-none">
        <span>{editor.storage.characterCount.words()} words</span>
        <span>{editor.storage.characterCount.characters()} chars</span>
      </div>

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
