import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Youtube } from '@tiptap/extension-youtube'
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
  Link2,
  List,
  Loader2,
  MonitorPlay,
  Quote,
  Redo2,
  Undo2,
  Unlink,
} from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useUploadBodyImage } from '../hooks/use-upload-body-image'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
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

const ADMIN_HEADER_OFFSET_PX = 66

function Toolbar({
  editor,
  onPickImage,
  onAddLink,
  onRemoveLink,
  onAddYoutube,
  disabled,
  isUploading,
  isFloating = false,
}: {
  editor: Editor
  onPickImage: () => void
  onAddLink: () => void
  onRemoveLink: () => void
  onAddYoutube: () => void
  disabled: boolean
  isUploading: boolean
  isFloating?: boolean
}) {
  const {
    isBold,
    isItalic,
    isH1,
    isH2,
    isH3,
    isBullet,
    isBlockquote,
    isLink,
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
      isLink: e.isActive('link'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })

  return (
    <div
      className={cn(
        'sticky top-16.5 z-20 flex flex-wrap items-center gap-0.5 rounded-t-lg border-b bg-card/95 px-2 py-1.5 backdrop-blur supports-backdrop-filter:bg-card/80',
        isFloating && 'rounded-t-none shadow-sm ring-1 ring-border/40',
      )}
    >
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

      <Separator orientation="vertical" className="mx-1 h-5" />

      <ToolbarButton
        onClick={onAddLink}
        isActive={isLink}
        disabled={disabled}
        ariaLabel="Inserir ou editar link"
      >
        <Link2 />
      </ToolbarButton>

      <ToolbarButton
        onClick={onRemoveLink}
        disabled={disabled || !isLink}
        ariaLabel="Remover link"
      >
        <Unlink />
      </ToolbarButton>

      <ToolbarButton
        onClick={onAddYoutube}
        disabled={disabled}
        ariaLabel="Inserir vídeo do YouTube"
      >
        <MonitorPlay />
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
  const toolbarSentinelRef = useRef<HTMLDivElement>(null)
  const uploadMutation = useUploadBodyImage()

  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkHref, setLinkHref] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [isToolbarFloating, setIsToolbarFloating] = useState(false)

  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
            target: '_blank',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg border border-border',
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
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

  useEffect(() => {
    const sentinel = toolbarSentinelRef.current
    if (!sentinel) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsToolbarFloating(entry ? !entry.isIntersecting : false)
      },
      {
        threshold: [0],
        rootMargin: `-${ADMIN_HEADER_OFFSET_PX}px 0px 0px 0px`,
      },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

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

  function handleOpenLinkDialog() {
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').run()
    }

    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    const linkAttrs = editor.getAttributes('link') as Record<string, unknown>
    const hrefAttr = linkAttrs['href']
    const currentHref = typeof hrefAttr === 'string' ? hrefAttr : ''

    setLinkHref(currentHref)
    setLinkLabel(selectedText)
    setLinkDialogOpen(true)
  }

  function handleApplyLink() {
    const href = linkHref.trim()
    if (!href) return

    const label = linkLabel.trim() || href

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .insertContent({
        type: 'text',
        text: label,
        marks: [{ type: 'link', attrs: { href } }],
      })
      .run()

    setLinkDialogOpen(false)
  }

  function handleRemoveLink() {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
  }

  function handleOpenYoutubeDialog() {
    setYoutubeUrl('')
    setYoutubeDialogOpen(true)
  }

  function handleApplyYoutube() {
    const src = youtubeUrl.trim()
    if (!src) return

    const inserted = editor.chain().focus().setYoutubeVideo({ src }).run()

    if (!inserted) {
      toast.error('Informe um link válido do YouTube.')
      return
    }

    setYoutubeDialogOpen(false)
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-card',
        ariaInvalid && 'border-destructive ring-2 ring-destructive/20',
        className,
      )}
    >
      <div
        ref={toolbarSentinelRef}
        className="pointer-events-none h-px w-full"
        aria-hidden
      />

      <Toolbar
        editor={editor}
        onPickImage={handlePickImage}
        onAddLink={handleOpenLinkDialog}
        onRemoveLink={handleRemoveLink}
        onAddYoutube={handleOpenYoutubeDialog}
        disabled={disabled}
        isUploading={uploadMutation.isPending}
        isFloating={isToolbarFloating}
      />

      <div className="overflow-hidden rounded-b-lg">
        <EditorContent editor={editor} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir link</DialogTitle>
            <DialogDescription>
              Defina o texto exibido e o endereço para onde o link aponta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="rich-text-link-label">Texto do link</Label>
              <Input
                id="rich-text-link-label"
                value={linkLabel}
                onChange={(event) => setLinkLabel(event.target.value)}
                placeholder="Ex: Assista aqui"
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rich-text-link-href">Endereço (URL)</Label>
              <Input
                id="rich-text-link-href"
                type="url"
                value={linkHref}
                onChange={(event) => setLinkHref(event.target.value)}
                placeholder="https://exemplo.com"
                autoComplete="off"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleApplyLink()
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLinkDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleApplyLink}
              disabled={linkHref.trim().length === 0}
            >
              Aplicar link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir vídeo do YouTube</DialogTitle>
            <DialogDescription>
              Cole o link do vídeo. Aceita formatos como youtube.com/watch?v=...,
              youtu.be/... e youtube.com/shorts/...
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="rich-text-youtube-url">Link do vídeo</Label>
            <Input
              id="rich-text-youtube-url"
              type="url"
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              autoComplete="off"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleApplyYoutube()
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setYoutubeDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleApplyYoutube}
              disabled={youtubeUrl.trim().length === 0}
            >
              Inserir vídeo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
