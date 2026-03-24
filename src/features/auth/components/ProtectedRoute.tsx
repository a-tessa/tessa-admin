import { Navigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { AdminShell } from '@/app/layouts/AdminShell'
import { useAuth } from '@/features/auth/use-auth'
import { TessaLogoMark } from '@/shared/components/tessa-logo'

export function ProtectedRoute() {
  const { status } = useAuth()

  if (status === 'checking') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6">
        <TessaLogoMark className="h-10" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Restaurando sessão...
        </div>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" />
  }

  return <AdminShell />
}
