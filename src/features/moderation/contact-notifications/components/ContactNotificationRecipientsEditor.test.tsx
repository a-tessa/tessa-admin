import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchContactNotificationRecipients,
  replaceContactNotificationRecipients,
} from '../contact-notifications.service'
import { ContactNotificationRecipientsEditor } from './ContactNotificationRecipientsEditor'
import type { ContactNotificationRecipientsResponse } from '../types'

vi.mock('../contact-notifications.service', () => ({
  fetchContactNotificationRecipients: vi.fn(),
  replaceContactNotificationRecipients: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

type User = ReturnType<typeof userEvent.setup>

const mockedFetch = vi.mocked(fetchContactNotificationRecipients)
const mockedReplace = vi.mocked(replaceContactNotificationRecipients)

function makeResponse(
  overrides: Partial<ContactNotificationRecipientsResponse> = {},
): ContactNotificationRecipientsResponse {
  return {
    recipients: [
      { id: 'recipient-1', email: 'comercial@tessa.com.br', name: 'Comercial' },
    ],
    fallbackEmail: 'contato.tessa.estruturas@gmail.com',
    isEmailDeliveryConfigured: true,
    ...overrides,
  }
}

function getEmailInput(index: number): HTMLElement {
  const input = screen.getAllByLabelText('E-mail')[index]

  if (!input) {
    throw new Error(`Campo de e-mail ${String(index)} não encontrado.`)
  }

  return input
}

async function expandSection(user: User): Promise<void> {
  await user.click(
    await screen.findByRole('button', {
      name: /Destinatários das notificações/,
    }),
  )
  await screen.findByRole('button', { name: 'Adicionar destinatário' })
}

function renderEditor() {
  const rootRoute = createRootRoute()
  const editorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/moderacao/contatos',
    component: ContactNotificationRecipientsEditor,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([editorRoute]),
    history: createMemoryHistory({
      initialEntries: ['/moderacao/contatos'],
    }),
  })
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('seção dos destinatários das notificações de contato', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
    mockedReplace.mockReset()
    mockedFetch.mockResolvedValue(makeResponse())
    mockedReplace.mockResolvedValue(makeResponse())
  })

  it('começa recolhida e resume quem recebe as notificações', async () => {
    renderEditor()

    expect(
      await screen.findByText('comercial@tessa.com.br'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Adicionar destinatário' }),
    ).not.toBeInTheDocument()
  })

  it('lista os destinatários já cadastrados ao expandir', async () => {
    const user = userEvent.setup()
    renderEditor()

    await expandSection(user)

    expect(getEmailInput(0)).toHaveValue('comercial@tessa.com.br')
    expect(
      screen.queryByText('Nenhum destinatário cadastrado'),
    ).not.toBeInTheDocument()
  })

  it('avisa que o e-mail padrão do ambiente é usado enquanto a lista está vazia', async () => {
    const user = userEvent.setup()
    mockedFetch.mockResolvedValue(makeResponse({ recipients: [] }))
    renderEditor()

    expect(
      await screen.findByText(
        /Usando o endereço padrão do ambiente: contato\.tessa\.estruturas@gmail\.com/,
      ),
    ).toBeInTheDocument()

    await expandSection(user)

    expect(
      screen.getByText('Nenhum destinatário cadastrado'),
    ).toBeInTheDocument()
  })

  it('adiciona um destinatário e salva a lista normalizada', async () => {
    const user = userEvent.setup()
    renderEditor()

    await expandSection(user)
    await user.click(
      screen.getByRole('button', { name: 'Adicionar destinatário' }),
    )
    await user.type(getEmailInput(1), '  Diretoria@Tessa.com.BR ')
    await user.click(screen.getByRole('button', { name: /Salvar/ }))

    await waitFor(() => {
      expect(mockedReplace).toHaveBeenCalledWith({
        recipients: [
          { email: 'comercial@tessa.com.br', name: 'Comercial' },
          { email: 'diretoria@tessa.com.br', name: null },
        ],
      })
    })
  })

  it('bloqueia o salvamento quando o e-mail é inválido', async () => {
    const user = userEvent.setup()
    renderEditor()

    await expandSection(user)
    await user.click(
      screen.getByRole('button', { name: 'Adicionar destinatário' }),
    )
    await user.type(getEmailInput(1), 'sem-arroba')
    await user.click(screen.getByRole('button', { name: /Salvar/ }))

    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(mockedReplace).not.toHaveBeenCalled()
  })

  it('bloqueia o salvamento quando o mesmo e-mail aparece duas vezes', async () => {
    const user = userEvent.setup()
    renderEditor()

    await expandSection(user)
    await user.click(
      screen.getByRole('button', { name: 'Adicionar destinatário' }),
    )
    await user.type(getEmailInput(1), 'COMERCIAL@tessa.com.br')
    await user.click(screen.getByRole('button', { name: /Salvar/ }))

    expect(
      await screen.findByText('Este e-mail já está na lista.'),
    ).toBeInTheDocument()
    expect(mockedReplace).not.toHaveBeenCalled()
  })
})
