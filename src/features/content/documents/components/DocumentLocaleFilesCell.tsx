import {
  ChevronDown,
  ExternalLink,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { LocaleFlag } from '@/shared/components/locale-flag'
import { Button } from '@/shared/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { cn } from '@/shared/lib/utils'
import {
  useDeleteDocumentCover,
  useDeleteDocumentFile,
  useUploadDocumentCover,
  useUploadDocumentFile,
} from '../hooks/use-document-mutations'
import {
  ALL_CONTENT_LOCALES,
  LOCALE_LABELS,
  type ContentLocale,
  type DocumentAdmin,
  type DocumentFile,
} from '../types'

interface DocumentLocaleFilesCellProps {
  document: DocumentAdmin
}

type BusyKind = 'pdf' | 'cover' | 'delete-pdf' | 'delete-cover'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(2)} MB`
}

function fileForLocale(
  files: DocumentFile[],
  locale: ContentLocale,
): DocumentFile | undefined {
  return files.find((file) => file.locale === locale)
}

function localeStatusLabel(file: DocumentFile | undefined): string {
  if (!file) return 'Sem PDF'
  if (!file.coverImageUrl) return 'PDF · sem capa'
  return 'PDF · capa'
}

export function DocumentLocaleFilesCell({
  document,
}: DocumentLocaleFilesCellProps) {
  const uploadMutation = useUploadDocumentFile()
  const deleteMutation = useDeleteDocumentFile()
  const uploadCoverMutation = useUploadDocumentCover()
  const deleteCoverMutation = useDeleteDocumentCover()

  const [openLocales, setOpenLocales] = useState<
    Partial<Record<ContentLocale, boolean>>
  >({})
  const [activeLocale, setActiveLocale] = useState<ContentLocale | null>(null)
  const [busyKind, setBusyKind] = useState<BusyKind | null>(null)
  const pdfInputRefs = useRef<
    Partial<Record<ContentLocale, HTMLInputElement | null>>
  >({})
  const coverInputRefs = useRef<
    Partial<Record<ContentLocale, HTMLInputElement | null>>
  >({})

  const isBusy =
    uploadMutation.isPending ||
    deleteMutation.isPending ||
    uploadCoverMutation.isPending ||
    deleteCoverMutation.isPending

  function setLocaleOpen(locale: ContentLocale, open: boolean) {
    setOpenLocales((current) => ({ ...current, [locale]: open }))
  }

  function handlePdfChange(
    locale: ContentLocale,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setActiveLocale(locale)
    setBusyKind('pdf')
    uploadMutation.mutate(
      { documentId: document.id, locale, file },
      {
        onSuccess: () => {
          toast.success(`PDF ${LOCALE_LABELS[locale]} enviado.`)
          setActiveLocale(null)
          setBusyKind(null)
        },
        onError: (error) => {
          toast.error(error.message)
          setActiveLocale(null)
          setBusyKind(null)
        },
      },
    )
  }

  function handleCoverChange(
    locale: ContentLocale,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setActiveLocale(locale)
    setBusyKind('cover')
    uploadCoverMutation.mutate(
      { documentId: document.id, locale, file },
      {
        onSuccess: () => {
          toast.success(`Capa ${LOCALE_LABELS[locale]} enviada.`)
          setActiveLocale(null)
          setBusyKind(null)
        },
        onError: (error) => {
          toast.error(error.message)
          setActiveLocale(null)
          setBusyKind(null)
        },
      },
    )
  }

  function handleDeletePdf(locale: ContentLocale) {
    setActiveLocale(locale)
    setBusyKind('delete-pdf')
    deleteMutation.mutate(
      { documentId: document.id, locale },
      {
        onSuccess: () => {
          toast.success(`PDF ${LOCALE_LABELS[locale]} removido.`)
          setActiveLocale(null)
          setBusyKind(null)
        },
        onError: (error) => {
          toast.error(error.message)
          setActiveLocale(null)
          setBusyKind(null)
        },
      },
    )
  }

  function handleDeleteCover(locale: ContentLocale) {
    setActiveLocale(locale)
    setBusyKind('delete-cover')
    deleteCoverMutation.mutate(
      { documentId: document.id, locale },
      {
        onSuccess: () => {
          toast.success(`Capa ${LOCALE_LABELS[locale]} removida.`)
          setActiveLocale(null)
          setBusyKind(null)
        },
        onError: (error) => {
          toast.error(error.message)
          setActiveLocale(null)
          setBusyKind(null)
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {ALL_CONTENT_LOCALES.map((locale) => {
        const file = fileForLocale(document.files, locale)
        const localeBusy = isBusy && activeLocale === locale
        const open = openLocales[locale] ?? false

        return (
          <Collapsible
            key={locale}
            open={open}
            onOpenChange={(nextOpen) => setLocaleOpen(locale, nextOpen)}
          >
            <div className="overflow-hidden rounded-md border-2 border-border">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-left hover:bg-secondary"
                >
                  <LocaleFlag locale={locale} />
                  <span className="min-w-24 text-xs font-medium">
                    {LOCALE_LABELS[locale]}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {localeStatusLabel(file)}
                  </span>
                  <ChevronDown
                    className={cn(
                      'ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                      open && 'rotate-180',
                    )}
                  />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="flex flex-col gap-2 border-t-2 border-border px-2 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {file ? (
                      <>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-40 items-center gap-1 truncate text-xs text-primary underline-offset-2 hover:underline"
                          title={file.originalFilename ?? file.url}
                        >
                          <ExternalLink className="size-3 shrink-0" />
                          <span className="truncate">
                            {file.originalFilename ?? 'PDF'}
                          </span>
                        </a>
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(file.sizeBytes)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Sem PDF
                      </span>
                    )}

                    <div className="ml-auto flex items-center gap-1">
                      <input
                        ref={(element) => {
                          pdfInputRefs.current[locale] = element
                        }}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        disabled={isBusy}
                        onChange={(event) => handlePdfChange(locale, event)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => pdfInputRefs.current[locale]?.click()}
                      >
                        {localeBusy && busyKind === 'pdf' ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Upload className="size-3.5" />
                        )}
                        {file ? 'Trocar PDF' : 'PDF'}
                      </Button>
                      {file ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isBusy}
                          onClick={() => handleDeletePdf(locale)}
                          aria-label={`Remover PDF ${LOCALE_LABELS[locale]}`}
                        >
                          {localeBusy && busyKind === 'delete-pdf' ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {file ? (
                    <div className="flex flex-wrap items-center gap-2 border-t-2 border-border pt-2">
                      {file.coverImageUrl ? (
                        <img
                          src={file.coverImageUrl}
                          alt=""
                          className="h-12 w-[4.5rem] rounded object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sem capa
                        </span>
                      )}

                      <div className="ml-auto flex items-center gap-1">
                        <input
                          ref={(element) => {
                            coverInputRefs.current[locale] = element
                          }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={isBusy}
                          onChange={(event) => handleCoverChange(locale, event)}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() =>
                            coverInputRefs.current[locale]?.click()
                          }
                        >
                          {localeBusy && busyKind === 'cover' ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <ImagePlus className="size-3.5" />
                          )}
                          {file.coverImageUrl ? 'Trocar capa' : 'Capa'}
                        </Button>
                        {file.coverImageUrl ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={isBusy}
                            onClick={() => handleDeleteCover(locale)}
                            aria-label={`Remover capa ${LOCALE_LABELS[locale]}`}
                          >
                            {localeBusy && busyKind === 'delete-cover' ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )
      })}
    </div>
  )
}
