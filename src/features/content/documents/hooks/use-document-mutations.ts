import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentKeys } from '../documents.queries'
import {
  createDocument,
  deleteDocument,
  deleteDocumentCover,
  deleteDocumentFile,
  updateDocument,
  uploadDocumentCover,
  uploadDocumentPdf,
} from '../documents.service'
import type { ContentLocale, DocumentFormInput } from '../types'

export function useCreateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DocumentFormInput) => createDocument(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DocumentFormInput }) =>
      updateDocument(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useUploadDocumentFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentId,
      locale,
      file,
    }: {
      documentId: string
      locale: ContentLocale
      file: File
    }) => uploadDocumentPdf(documentId, locale, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useDeleteDocumentFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentId,
      locale,
    }: {
      documentId: string
      locale: ContentLocale
    }) => deleteDocumentFile(documentId, locale),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useUploadDocumentCover() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentId,
      locale,
      file,
    }: {
      documentId: string
      locale: ContentLocale
      file: File
    }) => uploadDocumentCover(documentId, locale, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useDeleteDocumentCover() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentId,
      locale,
    }: {
      documentId: string
      locale: ContentLocale
    }) => deleteDocumentCover(documentId, locale),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}
