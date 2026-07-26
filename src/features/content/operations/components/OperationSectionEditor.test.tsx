import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createOperationSection,
  deleteOperationSection,
  fetchOperationSection,
  updateOperationSection,
  uploadOperationAsset,
} from '../operations.service'
import { OperationSectionEditor } from './OperationSectionEditor'
import type { OperationSection } from '../types'

vi.mock('../operations.service', () => ({
  fetchOperationSection: vi.fn(),
  createOperationSection: vi.fn(),
  updateOperationSection: vi.fn(),
  deleteOperationSection: vi.fn(),
  uploadOperationAsset: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockedFetch = vi.mocked(fetchOperationSection)
const mockedCreate = vi.mocked(createOperationSection)
const mockedUpdate = vi.mocked(updateOperationSection)
const mockedDelete = vi.mocked(deleteOperationSection)
const mockedUpload = vi.mocked(uploadOperationAsset)

const section: OperationSection = {
  images: Array.from({ length: 6 }, (_, index) =>
    index === 0
      ? {
          url: `https://cdn.example.com/operations/${String(index)}.webp`,
          alt: `Alt ${String(index)}`,
          caption: 'Legenda 0',
        }
      : {
          url: `https://cdn.example.com/operations/${String(index)}.webp`,
          alt: `Alt ${String(index)}`,
        },
  ),
}

function renderEditor() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const rootRoute = createRootRoute()
  const editorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/conteudo/pagina-inicial',
    component: OperationSectionEditor,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([editorRoute]),
    history: createMemoryHistory({
      initialEntries: ['/conteudo/pagina-inicial'],
    }),
  })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { queryClient, router }
}

afterEach(() => {
  cleanup()
})

describe('OperationSectionEditor', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
    mockedCreate.mockReset()
    mockedUpdate.mockReset()
    mockedDelete.mockReset()
    mockedUpload.mockReset()
  })

  it('mostra loading, erro com nova tentativa e carrega o rascunho', async () => {
    let resolveFetch: ((value: OperationSection | null) => void) | undefined
    mockedFetch.mockImplementation(
      () =>
        new Promise<OperationSection | null>((resolve) => {
          resolveFetch = resolve
        }),
    )

    renderEditor()
    await waitFor(() => {
      expect(
        document.querySelectorAll('[data-slot="skeleton"]').length,
      ).toBeGreaterThan(0)
    })

    resolveFetch?.(null)
    await screen.findByText(
      'Nenhuma imagem no rascunho. Adicione arquivos para começar.',
    )

    cleanup()
    mockedFetch.mockReset()
    mockedFetch.mockRejectedValue(new Error('Falha de rede'))
    renderEditor()

    expect(
      await screen.findByText('Não foi possível carregar a seção Operações'),
    ).toBeInTheDocument()

    mockedFetch.mockResolvedValue(section)
    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    )
    expect(await screen.findByText('Imagem 1')).toBeInTheDocument()
  })

  it('exibe aviso persistente ao salvar com menos de seis imagens e salva o rascunho', async () => {
    const user = userEvent.setup()
    mockedFetch.mockResolvedValue({
      images: [
        {
          url: 'https://cdn.example.com/operations/0.webp',
          alt: 'Alt 0',
        },
      ],
    })
    mockedUpdate.mockResolvedValue({
      operationSection: {
        images: [
          {
            url: 'https://cdn.example.com/operations/0.webp',
            alt: 'Alt 0 atualizado',
          },
        ],
      },
    })

    renderEditor()
    expect(
      await screen.findByText('Publicação bloqueada nesta galeria'),
    ).toBeInTheDocument()

    const altInput = screen.getByLabelText('Texto alternativo')
    await user.clear(altInput)
    await user.type(altInput, 'Alt 0 atualizado')
    expect(altInput).toHaveValue('Alt 0 atualizado')

    await user.click(screen.getByRole('button', { name: 'Salvar rascunho' }))

    await waitFor(() => {
      expect(mockedUpdate).toHaveBeenCalledWith({
        images: [
          {
            url: 'https://cdn.example.com/operations/0.webp',
            alt: 'Alt 0 atualizado',
          },
        ],
      })
    })
  })

  it('faz upload com progresso, permite retry isolado e reordena por teclado', async () => {
    const user = userEvent.setup()
    mockedFetch.mockResolvedValue(null)

    let rejectFirst: ((error: Error) => void) | undefined
    let resolveSecond: ((value: {
      url: string
      pathname: string
      mimeType: string
      sizeBytes: number
      originalFilename: string
      index: number
    }) => void) | undefined

    mockedUpload
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectFirst = reject as (error: Error) => void
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve
          }),
      )
      .mockResolvedValue({
        url: 'https://cdn.example.com/retry.webp',
        pathname: 'path',
        mimeType: 'image/webp',
        sizeBytes: 10,
        originalFilename: 'a.jpg',
        index: 0,
      })

    renderEditor()
    await screen.findByText(
      'Nenhuma imagem no rascunho. Adicione arquivos para começar.',
    )

    const fileInput = document.querySelector('input[type="file"][multiple]')
    if (!(fileInput instanceof HTMLInputElement)) {
      throw new Error('expected file input')
    }
    const fileA = new File([new Uint8Array([1, 2, 3])], 'a.jpg', {
      type: 'image/jpeg',
    })
    const fileB = new File([new Uint8Array([4, 5, 6])], 'b.png', {
      type: 'image/png',
    })

    await user.upload(fileInput, [fileA, fileB])

    expect(await screen.findAllByText('Enviando 0%')).toHaveLength(2)
    act(() => {
      mockedUpload.mock.calls[0]?.[2]?.(42)
    })
    expect(await screen.findByText('Enviando 42%')).toBeInTheDocument()

    rejectFirst?.(new Error('Falha temporária'))
    resolveSecond?.({
      url: 'https://cdn.example.com/b.webp',
      pathname: 'path-b',
      mimeType: 'image/webp',
      sizeBytes: 10,
      originalFilename: 'b.png',
      index: 1,
    })

    expect(await screen.findByText('Falha temporária')).toBeInTheDocument()
    expect(await screen.findByText('Pronto')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    await waitFor(() => {
      expect(mockedUpload).toHaveBeenCalledTimes(3)
    })

    const secondItem = await screen.findByTestId('operation-item-1')
    await user.click(
      within(secondItem).getByRole('button', {
        name: 'Mover imagem 2 para cima',
      }),
    )

    const reorderedFirst = await screen.findByTestId('operation-item-0')
    expect(
      within(reorderedFirst).getByRole('img', { name: 'Prévia da imagem 1' }),
    ).toHaveAttribute('src', 'https://cdn.example.com/b.webp')
  })

  it('rejeita arquivo inválido antes do envio', async () => {
    const { toast } = await import('sonner')
    mockedFetch.mockResolvedValue(null)
    renderEditor()
    await screen.findByText(
      'Nenhuma imagem no rascunho. Adicione arquivos para começar.',
    )

    const fileInput = document.querySelector('input[type="file"][multiple]')
    if (!(fileInput instanceof HTMLInputElement)) {
      throw new Error('expected file input')
    }
    const invalid = new File([new Uint8Array([1])], 'doc.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(fileInput, {
      target: { files: [invalid] },
    })

    expect(mockedUpload).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalled()
    expect(
      screen.getByText(
        'Nenhuma imagem no rascunho. Adicione arquivos para começar.',
      ),
    ).toBeInTheDocument()
  })

  it('impede novas seleções ao atingir o limite de 40 imagens', async () => {
    const { toast } = await import('sonner')
    mockedFetch.mockResolvedValue({
      images: Array.from({ length: 40 }, (_, index) => ({
        url: `https://cdn.example.com/operations/${String(index)}.webp`,
        alt: `Alt ${String(index)}`,
      })),
    })

    renderEditor()
    expect(await screen.findByText('40 / 40 imagens')).toBeInTheDocument()

    const fileInput = document.querySelector('input[type="file"][multiple]')
    if (!(fileInput instanceof HTMLInputElement)) {
      throw new Error('expected file input')
    }
    expect(fileInput).toBeDisabled()

    fireEvent.change(fileInput, {
      target: {
        files: [
          new File([new Uint8Array([1])], 'extra.jpg', { type: 'image/jpeg' }),
        ],
      },
    })

    expect(mockedUpload).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(
      'A galeria já atingiu o limite de 40 imagens.',
    )
  })

  it('exclui um item do rascunho e permite substituir a imagem mantendo os textos', async () => {
    const user = userEvent.setup()
    mockedFetch.mockResolvedValue(section)
    mockedUpload.mockResolvedValue({
      url: 'https://cdn.example.com/operations/replaced.webp',
      pathname: 'path',
      mimeType: 'image/webp',
      sizeBytes: 12,
      originalFilename: 'replaced.jpg',
      index: 0,
    })

    renderEditor()
    expect(await screen.findByText('Imagem 1')).toBeInTheDocument()

    const secondItem = screen.getByTestId('operation-item-1')
    await user.click(within(secondItem).getByRole('button', { name: 'Excluir' }))
    expect(screen.queryByTestId('operation-item-5')).not.toBeInTheDocument()
    expect(screen.getByText('5 / 40 imagens')).toBeInTheDocument()

    const firstItem = screen.getByTestId('operation-item-0')
    const replaceInput = firstItem.querySelector('input[type="file"]')
    if (!(replaceInput instanceof HTMLInputElement)) {
      throw new Error('expected replace file input')
    }
    const replacement = new File([new Uint8Array([9, 9])], 'replaced.jpg', {
      type: 'image/jpeg',
    })
    await user.upload(replaceInput, replacement)

    await waitFor(() => {
      expect(mockedUpload).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(within(firstItem).getByRole('img', { name: 'Alt 0' })).toHaveAttribute(
        'src',
        'https://cdn.example.com/operations/replaced.webp',
      )
    })
    expect(within(firstItem).getByLabelText('Texto alternativo')).toHaveValue(
      'Alt 0',
    )
  })
})
