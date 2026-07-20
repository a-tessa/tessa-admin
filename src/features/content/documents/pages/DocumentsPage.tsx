import {
  FileDown,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { LocaleFlags } from '@/shared/components/locale-flag'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { DocumentFormDialog } from '../components/DocumentFormDialog'
import { DocumentLocaleFilesCell } from '../components/DocumentLocaleFilesCell'
import {
  useCreateDocument,
  useDeleteDocument,
  useUpdateDocument,
} from '../hooks/use-document-mutations'
import { useDocuments } from '../hooks/use-documents'
import type { DocumentAdmin, DocumentFormInput } from '../types'

export function DocumentsPage() {
  const documentsQuery = useDocuments()
  const createMutation = useCreateDocument()
  const updateMutation = useUpdateDocument()
  const deleteMutation = useDeleteDocument()

  const [formOpen, setFormOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<DocumentAdmin | undefined>(
    undefined,
  )
  const [deletingDocument, setDeletingDocument] = useState<DocumentAdmin | null>(
    null,
  )

  const documents = documentsQuery.data?.documents
  const hasDocuments = documents && documents.length > 0
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  function openCreate() {
    setEditingDocument(undefined)
    setFormOpen(true)
  }

  function openEdit(document: DocumentAdmin) {
    setEditingDocument(document)
    setFormOpen(true)
  }

  function handleFormSubmit(input: DocumentFormInput) {
    if (editingDocument) {
      updateMutation.mutate(
        { id: editingDocument.id, input },
        {
          onSuccess: () => {
            toast.success('Documento atualizado.')
            setFormOpen(false)
          },
          onError: (error) => toast.error(error.message),
        },
      )
      return
    }

    createMutation.mutate(input, {
      onSuccess: () => {
        toast.success('Documento criado. Envie os PDFs por idioma na listagem.')
        setFormOpen(false)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  function handleDelete() {
    if (!deletingDocument) return

    deleteMutation.mutate(deletingDocument.id, {
      onSuccess: () => {
        toast.success('Documento removido.')
        setDeletingDocument(null)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <div className="space-y-6">
      <Card className="ring-2 ring-foreground/15">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 border-b-2 border-border pb-4">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <FileDown className="size-5" />
              Documentos
            </CardTitle>
            <CardDescription>
              Manuais, folders e apresentações por idioma. O visitante só vê o
              documento se houver PDF no idioma selecionado.
            </CardDescription>
          </div>
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Novo documento
          </Button>
        </CardHeader>
        <CardContent>
          {documentsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : documentsQuery.isError ? (
            <p className="text-sm text-destructive">
              {documentsQuery.error.message}
            </p>
          ) : !hasDocuments ? (
            <div className="rounded-lg border-2 border-dashed border-border px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum documento cadastrado ainda.
              </p>
              <Button type="button" className="mt-4" onClick={openCreate}>
                <Plus className="size-4" />
                Criar primeiro documento
              </Button>
            </div>
          ) : (
            <Table className="[&_tr]:border-b-2">
              <TableHeader>
                <TableRow className="border-b-2 hover:bg-transparent">
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Idiomas</TableHead>
                  <TableHead className="min-w-80">Arquivos PDF</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id} className="border-b-2">
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{document.title}</p>
                        {document.description ? (
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {document.description}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{document.categorySlug}</TableCell>
                    <TableCell className="text-sm">{document.order}</TableCell>
                    <TableCell>
                      {document.availableLocales.length > 0 ? (
                        <LocaleFlags locales={document.availableLocales} />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Nenhum PDF
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DocumentLocaleFilesCell document={document} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label="Ações do documento"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(document)}>
                            <Pencil className="size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeletingDocument(document)}
                          >
                            <Trash2 className="size-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DocumentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        document={editingDocument}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={deletingDocument !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingDocument(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove o documento e todos os PDFs associados em todos os
              idiomas.
              {deletingDocument ? ` (“${deletingDocument.title}”)` : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isMutating}
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Excluindo…
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
