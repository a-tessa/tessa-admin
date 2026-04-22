import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  List,
  Loader2,
  Quote,
  Redo2,
  Undo2,
} from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useUploadBodyImage } from '../hooks/use-upload-body-image'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  ariaInvalid?: boolean
  className?: string
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  ariaLabel: string
  children: ReactNode
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  ariaLabel,
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={cn(
        isActive
          ? 'border border-primary/35 bg-primary/12 text-primary shadow-sm hover:bg-primary/18 hover:text-primary dark:border-primary/45 dark:bg-primary/18 dark:hover:bg-primary/24'
          : 'border border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </Button>
  )
}

function Toolbar({
  editor,
  onPickImage,
  disabled,
  isUploading,
}: {
  editor: Editor
  onPickImage: () => void
  disabled: boolean
  isUploading: boolean
}) {
  const {
    isBold,
    isItalic,
    isH1,
    isH2,
    isH3,
    isBullet,
    isBlockquote,
    canUndo,
    canRedo,
  } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      isBold: e.isActive('bold'),
      isItalic: e.isActive('italic'),
      isH1: e.isActive('heading', { level: 1 }),
      isH2: e.isActive('heading', { level: 2 }),
      isH3: e.isActive('heading', { level: 3 }),
      isBullet: e.isActive('bulletList'),
      isBlockquote: e.isActive('blockquote'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5 backdrop-blur">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={isBold}
        disabled={disabled}
        ariaLabel="Negrito"
      >
        <Bold />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={isItalic}
        disabled={disabled}
        ariaLabel="Itálico"
      >
        <Italic />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={isH1}
        disabled={disabled}
        ariaLabel="Título grande"
      >
        <Heading1 />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={isH2}
        disabled={disabled}
        ariaLabel="Título médio"
      >
        <Heading2 />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={isH3}
        disabled={disabled}
        ariaLabel="Título pequeno"
      >
        <Heading3 />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={isBullet}
        disabled={disabled}
        ariaLabel="Lista com marcadores"
      >
        <List />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={isBlockquote}
        disabled={disabled}
        ariaLabel="Citação"
      >
        <Quote />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton
        onClick={onPickImage}
        disabled={disabled || isUploading}
        ariaLabel="Inserir imagem"
      >
        {isUploading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !canUndo}
          ariaLabel="Desfazer"
        >
          <Undo2 />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !canRedo}
          ariaLabel="Refazer"
        >
          <Redo2 />
        </ToolbarButton>
      </div>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Comece a escrever seu artigo...',
  disabled = false,
  ariaInvalid = false,
  className,
}: RichTextEditorProps) {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadBodyImage()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg border border-border',
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        id: inputId,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-invalid': ariaInvalid ? 'true' : 'false',
        class:
          'blog-editor-content min-h-[320px] px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
  })

  useEffect(() => {
    const currentHtml = editor.getHTML()
    const normalized = value === '' ? '<p></p>' : value
    if (currentHtml !== normalized) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  useEffect(() => {
    editor.setEditable(!disabled)
  }, [editor, disabled])

  function handlePickImage() {
    fileInputRef.current?.click()
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    uploadMutation.mutate(file, {
      onSuccess: ({ url }) => {
        editor.chain().focus().setImage({ src: url }).run()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-card',
        ariaInvalid && 'border-destructive ring-2 ring-destructive/20',
        className,
      )}
    >
      <Toolbar
        editor={editor}
        onPickImage={handlePickImage}
        disabled={disabled}
        isUploading={uploadMutation.isPending}
      />

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  )
}
