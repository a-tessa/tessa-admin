import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchHeroSection, updateHeroSection } from '../hero.service'
import type { HeroTopic } from '../types'
import { HeroSectionPage } from './HeroSectionPage'

vi.mock('../hero.service', () => ({
  fetchHeroSection: vi.fn(),
  createHeroSection: vi.fn(),
  updateHeroSection: vi.fn(),
  deleteHeroSection: vi.fn(),
  deleteHeroSectionSlide: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockedFetch = vi.mocked(fetchHeroSection)
const mockedUpdate = vi.mocked(updateHeroSection)

function topic(title: string): HeroTopic {
  return {
    title,
    description: `Descrição de ${title}`,
    image: 'https://example.com/hero.jpg',
    button: { text: 'Saiba mais', url: '/servicos' },
  }
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <HeroSectionPage />
    </QueryClientProvider>,
  )
}

describe('HeroSectionPage', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
    mockedUpdate.mockReset()
  })

  it('desabilita novo tópico quando já existem 6', async () => {
    mockedFetch.mockResolvedValue({
      heroSection: [
        topic('Estruturas'),
        topic('Galpões'),
        topic('Coberturas'),
        topic('Telhas'),
        topic('Carport'),
        topic('Solo'),
      ],
    })

    renderPage()

    const button = await screen.findByRole('button', { name: 'Novo tópico' })
    expect(button).toBeDisabled()
    expect(screen.getByText('máx. 6 tópicos')).toBeInTheDocument()
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('permite novo tópico quando ainda há vaga', async () => {
    mockedFetch.mockResolvedValue({
      heroSection: [topic('Estruturas'), topic('Galpões'), topic('Coberturas')],
    })

    renderPage()

    const button = await screen.findByRole('button', { name: 'Novo tópico' })
    expect(button).toBeEnabled()
    expect(screen.queryByText('máx. 6 tópicos')).not.toBeInTheDocument()
  })
})
