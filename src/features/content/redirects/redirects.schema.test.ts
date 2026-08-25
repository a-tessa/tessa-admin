import { describe, expect, it } from 'vitest'
import {
  defaultRedirectFormValues,
  redirectFormSchema,
} from './redirects.schema'

describe('redirectFormSchema', () => {
  it('aceita caminho interno para caminho interno ou URL absoluta', () => {
    expect(
      redirectFormSchema.safeParse({
        ...defaultRedirectFormValues,
        fromPath: '/blog/post-antigo',
        toPath: '/blog/post-novo',
      }).success,
    ).toBe(true)
    expect(
      redirectFormSchema.safeParse({
        ...defaultRedirectFormValues,
        fromPath: '/2023/05/post',
        toPath: 'https://tessa.com.br/blog/post',
      }).success,
    ).toBe(true)
  })

  it('rejeita origem sem barra inicial, destino igual à origem e query string', () => {
    expect(
      redirectFormSchema.safeParse({
        ...defaultRedirectFormValues,
        fromPath: 'blog/antigo',
        toPath: '/blog/novo',
      }).success,
    ).toBe(false)
    expect(
      redirectFormSchema.safeParse({
        ...defaultRedirectFormValues,
        fromPath: '/blog/mesmo',
        toPath: '/blog/mesmo',
      }).success,
    ).toBe(false)
    expect(
      redirectFormSchema.safeParse({
        ...defaultRedirectFormValues,
        fromPath: '/blog/antigo?utm=1',
        toPath: '/blog/novo',
      }).success,
    ).toBe(false)
  })
})
