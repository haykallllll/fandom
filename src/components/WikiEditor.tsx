import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/src/lib/utils';
import { 
  Bold, Italic, Heading1, Heading2, List, ListOrdered, 
  Link as LinkIcon, Image as ImageIcon, Undo, Redo 
} from 'lucide-react';

interface WikiEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function WikiEditor({ content, onChange, placeholder }: WikiEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full h-auto shadow-md my-8',
        },
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
    const url = window.prompt('Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL or [[Wiki Page]]:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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
          onClick={setLink} 
          isActive={editor.isActive('link')}
          icon={<LinkIcon size={18} />}
        />
        <MenuButton 
          onClick={addImage} 
          icon={<ImageIcon size={18} />}
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
