import type { PropsWithChildren, ReactNode } from 'react'
import { TessaLogo } from '@/shared/components/tessa-logo'

interface AuthScreenLayoutProps extends PropsWithChildren {
  title: string
  description: string
  footer?: ReactNode
}

export function AuthScreenLayout({
  title,
  description,
  footer,
  children,
}: AuthScreenLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-foreground lg:block">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, oklch(0.53 0.12 163 / 0.55), transparent 50%), radial-gradient(circle at 80% 75%, oklch(0.6 0.19 230 / 0.3), transparent 50%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h1v1H0z\' fill=\'%23fff\'/%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10 text-primary-foreground xl:p-16">
          <TessaLogo className="h-15 text-white" />
          <div className="mx-auto my-auto max-w-lg">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
              Gerencie conteúdo e&nbsp;usuários em um só lugar.
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <TessaLogo className="h-7 text-foreground lg:hidden" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
          {footer}
        </div>
      </div>
    </div>
  )
}
