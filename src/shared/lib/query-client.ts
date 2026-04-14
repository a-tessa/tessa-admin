import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/shared/lib/api'

export function createAppQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data === undefined) {
          return
        }

        const message =
          error instanceof ApiError
            ? error.message
            : 'Erro ao atualizar dados em segundo plano.'

        toast.error(message)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status === 401) {
            return false
          }
          return failureCount < 3
        },
      },
      mutations: {
        retry: 0,
      },
    },
  })
}
