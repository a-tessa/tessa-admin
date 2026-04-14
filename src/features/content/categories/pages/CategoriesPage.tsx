import { Loader2, MoreHorizontal, Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCategories } from '../hooks/use-categories'
import { useCreateCategory } from '../hooks/use-create-category'
import { useUpdateCategory } from '../hooks/use-update-category'
import { useDeleteCategory } from '../hooks/use-delete-category'
import { CategoryFormDialog } from '../components/CategoryFormDialog'
import type { Category, CategoryInput } from '../types'
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
import { Badge } from '@/shared/components/ui/badge'
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

export function CategoriesPage() {
  const categoriesQuery = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const categories = categoriesQuery.data?.categories
  const hasCategories = categories && categories.length > 0
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  function openCreate() {
    setEditingCategory(undefined)
    setFormOpen(true)
  }

  function openEdit(category: Category) {
    setEditingCategory(category)
    setFormOpen(true)
  }

  function handleFormSubmit(input: CategoryInput) {
    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, input },
        {
          onSuccess: () => {
            toast.success('Categoria atualizada.')
            setFormOpen(false)
          },
          onError: (error) => toast.error(error.message),
        },
      )
    } else {
      createMutation.mutate(input, {
        onSuccess: () => {
          toast.success('Categoria criada.')
          setFormOpen(false)
        },
        onError: (error) => toast.error(error.message),
      })
    }
  }

  function handleDelete() {
    if (!deletingCategory) return

    deleteMutation.mutate(deletingCategory.id, {
      onSuccess: () => {
        toast.success('Categoria removida.')
        setDeletingCategory(null)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Categorias</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as categorias de serviços da landing page.
          </p>
        </div>

        <Button className="gap-2" onClick={openCreate} disabled={isMutating}>
          <Plus className="size-4" />
          Nova categoria
        </Button>
      </div>

      {categoriesQuery.isPending ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {categoriesQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar</CardTitle>
            <CardDescription>{categoriesQuery.error.message}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {categoriesQuery.isSuccess && !hasCategories ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Tags className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma categoria cadastrada.</p>
            <Button className="mt-2 gap-2" onClick={openCreate}>
              <Plus className="size-4" />
              Criar categoria
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {hasCategories ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {category.slug}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(category)}>
                          <Pencil className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingCategory(category)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {String(categories.length)} categoria(s) no total
            </p>
          </div>
        </div>
      ) : null}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={deletingCategory !== null}
        onOpenChange={(open) => { if (!open) setDeletingCategory(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria <strong>{deletingCategory?.name}</strong> será removida.
              Se houver páginas de serviço vinculadas, a remoção será bloqueada pela API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
