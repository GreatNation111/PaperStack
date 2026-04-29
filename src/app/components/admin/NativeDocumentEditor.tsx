import { type ReactNode, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { Node } from '@tiptap/core';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Columns3,
  FileUp,
  Heading1,
  Heading2,
  Highlighter,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Plus,
  Redo2,
  Rows3,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import mammoth from 'mammoth';

const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  selectable: true,
  atom: true,
  parseHTML() {
    return [{ tag: 'div[data-page-break]' }];
  },
  renderHTML() {
    return ['div', { 'data-page-break': 'true', class: 'native-page-break' }];
  },
});

type NativeDocumentEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onStatus?: (message: string) => void;
  onError?: (message: string) => void;
};

type ToolbarButtonProps = {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ToolbarButton({ title, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`h-9 w-9 inline-flex items-center justify-center rounded-md border transition-colors ${
        active
          ? 'border-[#4F46E5] bg-[#4F46E5]/15 text-[#4F46E5]'
          : 'border-[#D6DAE4] bg-white text-[#1F2937] hover:bg-[#F3F4F6]'
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export function NativeDocumentEditor({ value, onChange, onUploadImage, onStatus, onError }: NativeDocumentEditorProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const docxInputRef = useRef<HTMLInputElement | null>(null);
  const [isImportingDocx, setIsImportingDocx] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({
        allowBase64: false,
        inline: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      PageBreak,
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class: 'native-doc-page focus:outline-none',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const nextHtml = value || '<p></p>';
    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml, false);
    }
  }, [editor, value]);

  const importDocx = async (file: File) => {
    if (!editor) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
      onError?.('Please select a .docx Word document.');
      return;
    }

    setIsImportingDocx(true);
    onStatus?.('Importing Word document...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            "p[style-name='Title'] => h1:fresh",
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
          ],
        }
      );
      editor.commands.setContent(result.value || '<p></p>');
      onChange(editor.getHTML());
      onStatus?.('');
      if (result.messages.length) {
        onError?.('Word document imported, but some advanced formatting may need a quick check.');
      }
    } catch (err) {
      console.error('DOCX import failed:', err);
      onError?.('Could not import this Word document.');
    } finally {
      setIsImportingDocx(false);
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  };

  const insertImage = async (file: File) => {
    if (!editor) return;
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file.');
      return;
    }

    setIsUploadingImage(true);
    onStatus?.('Uploading image...');
    try {
      const url = await onUploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      onStatus?.('');
    } catch (err) {
      console.error('Image upload failed:', err);
      onError?.('Could not upload this image.');
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const addLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Paste link URL', previousUrl || 'https://');

    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className="min-h-[380px] rounded-xl bg-white text-black flex items-center justify-center">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="native-doc-shell rounded-xl border border-[#D6DAE4] bg-[#EEF1F6] text-black overflow-hidden">
      <input
        ref={docxInputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void importDocx(file);
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void insertImage(file);
        }}
      />

      <div className="native-doc-toolbar sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-[#D6DAE4] bg-[#F8FAFC] p-3">
        <button
          type="button"
          onClick={() => docxInputRef.current?.click()}
          disabled={isImportingDocx}
          className="h-9 px-3 inline-flex items-center gap-2 rounded-md bg-[#111827] text-white text-sm font-medium hover:bg-[#1F2937] disabled:opacity-50"
        >
          <FileUp className="w-4 h-4" />
          {isImportingDocx ? 'Importing' : 'Import DOCX'}
        </button>
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
        <span className="h-7 w-px bg-[#D6DAE4]" />
        <ToolbarButton title="Paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Type className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <span className="h-7 w-px bg-[#D6DAE4]" />
        <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Strike" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Highlight" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>
        <span className="h-7 w-px bg-[#D6DAE4]" />
        <ToolbarButton title="Bulleted list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <span className="h-7 w-px bg-[#D6DAE4]" />
        <ToolbarButton title="Insert image" disabled={isUploadingImage} onClick={() => imageInputRef.current?.click()}>
          <ImagePlus className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Link" active={editor.isActive('link')} onClick={addLink}>
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Page break" onClick={() => editor.chain().focus().insertContent({ type: 'pageBreak' }).run()}>
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <span className="h-7 w-px bg-[#D6DAE4]" />
        <ToolbarButton title="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Add row" disabled={!editor.can().addRowAfter()} onClick={() => editor.chain().focus().addRowAfter().run()}>
          <Rows3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Add column" disabled={!editor.can().addColumnAfter()} onClick={() => editor.chain().focus().addColumnAfter().run()}>
          <Columns3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Delete row" disabled={!editor.can().deleteRow()} onClick={() => editor.chain().focus().deleteRow().run()}>
          <Trash2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Delete column" disabled={!editor.can().deleteColumn()} onClick={() => editor.chain().focus().deleteColumn().run()}>
          <Trash2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Delete table" disabled={!editor.can().deleteTable()} onClick={() => editor.chain().focus().deleteTable().run()}>
          <Trash2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Plus className="w-4 h-4 rotate-45" />
        </ToolbarButton>
      </div>

      <div className="native-doc-canvas max-h-[620px] overflow-auto px-4 py-6 sm:px-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
