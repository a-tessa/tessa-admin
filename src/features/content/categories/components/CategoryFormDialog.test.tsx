import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CategoryFormDialog } from './CategoryFormDialog'

describe('CategoryFormDialog', () => {
  it('mantém o slug ao editar só o nome', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <CategoryFormDialog
        open
        onOpenChange={() => undefined}
        category={{
          id: '1',
          name: 'QA Categoria',
          slug: 'qa-slug-personalizado',
        }}
        isPending={false}
        onSubmit={onSubmit}
      />,
    )

    const name = screen.getByLabelText('Nome')
    await user.clear(name)
    await user.type(name, 'QA Categoria Renomeada')

    expect(screen.getByLabelText('Slug')).toHaveValue('qa-slug-personalizado')

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'QA Categoria Renomeada',
      slug: 'qa-slug-personalizado',
    })
  })

  it('gera o slug a partir do nome ao criar', async () => {
    const user = userEvent.setup()

    render(
      <CategoryFormDialog
        open
        onOpenChange={() => undefined}
        isPending={false}
        onSubmit={() => undefined}
      />,
    )

    await user.type(screen.getByLabelText('Nome'), 'Galpões')

    expect(screen.getByLabelText('Slug')).toHaveValue('galpoes')
  })
})
