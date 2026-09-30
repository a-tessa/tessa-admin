import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCategories } from '../../categories'
import { ServiceForm } from './ServiceForm'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string
    children: ReactNode
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('../../categories', () => ({
  useCategories: vi.fn(),
}))

vi.mock('../../categories/components/UnpublishedCategoryNotice', () => ({
  UnpublishedCategoryNotice: () => null,
}))

const mockedUseCategories = vi.mocked(useCategories)

function renderForm() {
  render(
    <ServiceForm
      formId="service-create-form"
      isPending={false}
      submitLabel="Criar"
      onSubmit={() => undefined}
      onCancel={() => undefined}
    />,
  )
}

describe('ServiceForm category dropdown', () => {
  beforeEach(() => {
    mockedUseCategories.mockReset()
  })

  it('mostra que ainda não há categoria criada', async () => {
    const user = userEvent.setup()
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => undefined
    HTMLElement.prototype.releasePointerCapture = () => undefined
    mockedUseCategories.mockReturnValue({
      data: { categories: [] },
      isSuccess: true,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useCategories>)

    renderForm()

    const category = screen.getByRole('combobox', { name: 'Categoria' })
    expect(category).toHaveTextContent(
      'Ainda não há categoria criada para incluir um novo serviço.',
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Crie uma categoria antes de incluir um novo serviço.',
    )
    expect(screen.getByRole('link', { name: 'Criar categoria' })).toHaveAttribute(
      'href',
      '/conteudo/categorias',
    )

    await user.click(category)

    expect(await screen.findByRole('listbox')).toHaveTextContent(
      'Ainda não há categoria criada para incluir um novo serviço.',
    )
  })

  it('lista as categorias existentes', () => {
    mockedUseCategories.mockReturnValue({
      data: {
        categories: [{ id: '1', name: 'Galpões', slug: 'galpoes' }],
      },
      isSuccess: true,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useCategories>)

    renderForm()

    expect(screen.getByRole('combobox', { name: 'Categoria' })).toHaveTextContent(
      'Selecione uma categoria',
    )
    expect(screen.queryByRole('link', { name: 'Criar categoria' })).not.toBeInTheDocument()
  })
})
