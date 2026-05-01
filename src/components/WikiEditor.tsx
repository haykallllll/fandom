import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';
import { 
  Bold, Italic, Heading1, Heading2, List, ListOrdered, 
  Link as LinkIcon, Image as ImageIcon, Undo, Redo,
  AlignCenter, AlignLeft, AlignRight, Type
} from 'lucide-react';

interface WikiEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function WikiEditor({ content, onChange, placeholder }: WikiEditorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [autoFallback, setAutoFallback] = React.useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full h-auto shadow-md my-8 transition-all hover:ring-4 hover:ring-indigo-100 cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start documenting the lore...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate focus:outline-none min-h-[500px] max-w-none p-8 md:p-12',
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    console.log('Insert Image button clicked');
    fileInputRef.current?.click();
  };

  const insertBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        editor.chain().focus().setImage({ src: result }).run();
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Hanya diperbolehkan file gambar (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB.');
      return;
    }

    if (autoFallback) {
      console.log('Using auto-fallback to Base64');
      insertBase64(file);
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    console.log('Uploading file:', file.name);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `wiki/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        if (error.message.includes('bucket not found') || error.message.includes('row-level security policy')) {
          const isRls = error.message.includes('security policy');
          const errorType = isRls ? 'Permission denied (RLS Policy)' : 'Bucket "images" not found';
          
          console.error(`${errorType}. Check Supabase Storage settings.`);
          
          const choice = window.confirm(
            `Image upload failed: ${errorType}\n\n` +
            'Would you like to use Base64 (save image inside the page text) instead?\n\n' +
            'Tip: To fix this permanently, enable RLS policies for the "images" bucket in your Supabase dashboard.'
          );
          
          if (choice) {
            setAutoFallback(true);
            insertBase64(file);
          }
          return;
        }
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      console.log('Upload success, public URL:', publicUrl);
      editor.chain().focus().setImage({ src: publicUrl }).run();
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt(
      'Enter URL (e.g. https://...) or Wiki Page Name:', 
      previousUrl
    );

    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Handle [[Link]] style or plain page names
    let finalUrl = url;
    if (url.startsWith('[[') && url.endsWith(']]')) {
      const pageName = url.slice(2, -2);
      finalUrl = `/wiki/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
    } else if (!url.includes('://') && !url.startsWith('/') && !url.startsWith('#')) {
      // If it looks like a page name, auto-convert to wiki link
      finalUrl = `/wiki/${url.toLowerCase().replace(/\s+/g, '-')}`;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
  };

  return (
    <div className="border border-slate-200 rounded-[2rem] bg-white overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap gap-1">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive('bold')}
          icon={<Bold size={18} />}
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive('italic')}
          icon={<Italic size={18} />}
        />
        <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          isActive={editor.isActive('heading', { level: 1 })}
          icon={<Heading1 size={18} />}
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          isActive={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 size={18} />}
        />
        <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          isActive={editor.isActive('bulletList')}
          icon={<List size={18} />}
        />
        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          isActive={editor.isActive('orderedList')}
          icon={<ListOrdered size={18} />}
        />
        <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('left').run()} 
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={<AlignLeft size={18} />}
        />
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('center').run()} 
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={<AlignCenter size={18} />}
        />
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign('right').run()} 
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={<AlignRight size={18} />}
        />
        <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
        <MenuButton 
          onClick={setLink} 
          isActive={editor.isActive('link')}
          icon={<LinkIcon size={18} />}
        />
        <MenuButton 
          onClick={addImage} 
          icon={<ImageIcon size={18} />}
          disabled={isUploading}
        />
        {isUploading && (
          <div className="flex items-center px-2">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] ml-1 font-bold text-indigo-600">UPLOADING...</span>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <div className="flex-grow" />
        <MenuButton 
          onClick={() => editor.chain().focus().undo().run()} 
          icon={<Undo size={18} />}
          disabled={!editor.can().undo()}
        />
        <MenuButton 
          onClick={() => editor.chain().focus().redo().run()} 
          icon={<Redo size={18} />}
          disabled={!editor.can().redo()}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function MenuButton({ 
  onClick, 
  isActive, 
  icon, 
  disabled 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  icon: React.ReactNode; 
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2.5 rounded-xl transition-all",
        isActive 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
          : "text-slate-500 hover:bg-slate-200 hover:text-slate-900",
        disabled && "opacity-20 cursor-not-allowed"
      )}
    >
      {icon}
    </button>
  );
}
