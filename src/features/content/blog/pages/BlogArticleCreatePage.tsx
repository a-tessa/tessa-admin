import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { BlogArticleForm } from '../components/BlogArticleForm'
import { useCreateBlogArticle } from '../hooks/use-create-blog-article'

export function BlogArticleCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateBlogArticle()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1">
            <Link to="/conteudo/blog">
              <ArrowLeft className="size-3.5" />
              Voltar para a lista
            </Link>
          </Button>
          <h2 className="text-2xl font-semibold tracking-tight">
            Novo artigo de blog
          </h2>
          <p className="text-sm text-muted-foreground">
            Escreva um novo artigo. Você pode salvá-lo como rascunho a qualquer
            momento.
          </p>
        </div>
      </div>

      <BlogArticleForm
        isSubmitting={createMutation.isPending}
        onCancel={() => navigate({ to: '/conteudo/blog' })}
        onSubmit={(input) => {
          createMutation.mutate(input, {
            onSuccess: ({ article }) => {
              toast.success(
                input.status === 'published'
                  ? 'Artigo publicado com sucesso.'
                  : 'Rascunho salvo com sucesso.',
              )
              void navigate({
                to: '/conteudo/blog/$slug',
                params: { slug: article.slug },
              })
            },
            onError: (error) => toast.error(error.message),
          })
        }}
      />
    </div>
  )
}
