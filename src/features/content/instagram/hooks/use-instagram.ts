import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/shared/lib/api'
import {
  disconnectInstagram,
  fetchInstagramCatalog,
  fetchInstagramStatus,
  saveInstagramSelection,
  startInstagramOAuth,
  syncInstagramMedia,
} from '../instagram.service'
import { adminContentKeys } from '../../publish/publish.queries'

export const instagramStatusQueryKey = ['instagram', 'status'] as const
export const instagramCatalogQueryKey = ['instagram', 'catalog'] as const

export function useInstagramStatus() {
  return useQuery({
    queryKey: [...instagramStatusQueryKey],
    queryFn: fetchInstagramStatus,
  })
}

export function useStartInstagramOAuth() {
  return useMutation({
    mutationFn: startInstagramOAuth,
    onSuccess: (data) => {
      window.location.assign(data.authorizeUrl)
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível iniciar a conexão com o Instagram.'
      toast.error(message)
    },
  })
}

export function useInstagramCatalog(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...instagramCatalogQueryKey],
    queryFn: fetchInstagramCatalog,
    enabled: options?.enabled ?? true,
  })
}

export function useSyncInstagramMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: syncInstagramMedia,
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...instagramStatusQueryKey] }),
        queryClient.invalidateQueries({ queryKey: [...instagramCatalogQueryKey] }),
      ])
      toast.success(
        `Sincronização concluída: ${String(data.synced)} mídias atualizadas.`,
      )
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Falha ao sincronizar publicações do Instagram.'
      toast.error(message)
    },
  })
}

export function useSaveInstagramSelection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveInstagramSelection,
    onSuccess: async (catalog) => {
      queryClient.setQueryData([...instagramCatalogQueryKey], catalog)
      await queryClient.invalidateQueries({ queryKey: adminContentKeys.all })
      toast.success('Rascunho da seleção salvo.')
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.status === 409) {
        await queryClient.invalidateQueries({
          queryKey: [...instagramCatalogQueryKey],
        })
      }

      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar a seleção do Instagram.',
      )
    },
  })
}

export function useDisconnectInstagram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: disconnectInstagram,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...instagramStatusQueryKey] }),
        queryClient.invalidateQueries({ queryKey: [...instagramCatalogQueryKey] }),
        queryClient.invalidateQueries({ queryKey: adminContentKeys.all }),
      ])
      toast.success('Conta do Instagram desconectada.')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Falha ao desconectar a conta do Instagram.'
      toast.error(message)
    },
  })
}
