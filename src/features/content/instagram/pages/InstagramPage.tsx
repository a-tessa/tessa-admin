import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Link2Off,
  RefreshCw,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  useDisconnectInstagram,
  useInstagramStatus,
  useStartInstagramOAuth,
  useSyncInstagramMedia,
} from '../hooks/use-instagram'
import { InstagramCurationPanel } from '../components/InstagramCurationPanel'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useAuth } from '@/features/auth/use-auth'
import { formatDateTime } from '@/shared/lib/format'

function readOAuthQuery(): { connected: boolean; error: string | null } {
  if (typeof window === 'undefined') {
    return { connected: false, error: null }
  }

  const params = new URLSearchParams(window.location.search)
  return {
    connected: params.get('connected') === '1',
    error: params.get('error'),
  }
}

export function InstagramPage() {
  const { session } = useAuth()
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false)
  const oauthQuery = useMemo(() => readOAuthQuery(), [])
  const { data, isLoading, isError, error, refetch, isFetching } =
    useInstagramStatus()
  const startOAuth = useStartInstagramOAuth()
  const syncMedia = useSyncInstagramMedia()
  const disconnect = useDisconnectInstagram()

  const tokenExpiryLabel = data?.connection?.tokenExpiresAt
    ? formatDateTime(data.connection.tokenExpiresAt)
    : null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Instagram
          </h1>
          <p className="text-sm text-muted-foreground">
            Conecte a Página do Facebook vinculada ao Instagram oficial e
            escolha as três publicações exibidas na landing.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={isFetching ? 'animate-spin' : undefined} />
          Atualizar status
        </Button>
      </div>

      {oauthQuery.connected ? (
        <Alert variant="success">
          <CheckCircle2 />
          <AlertTitle>Conta conectada</AlertTitle>
          <AlertDescription>
            A conta do Instagram foi autorizada com sucesso. A sincronização
            inicial já foi disparada.
          </AlertDescription>
        </Alert>
      ) : null}

      {oauthQuery.error ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Falha na autorização</AlertTitle>
          <AlertDescription>{oauthQuery.error}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : null}

      {isError ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Não foi possível carregar o status</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : 'Erro inesperado ao consultar a API.'}
          </AlertDescription>
        </Alert>
      ) : null}

      {data && !data.configured ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Integração não configurada</AlertTitle>
          <AlertDescription>
            Defina as variáveis INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET,
            INSTAGRAM_REDIRECT_URI, INSTAGRAM_TOKEN_ENCRYPTION_KEY e
            ADMIN_APP_URL na API antes de conectar a conta.
          </AlertDescription>
        </Alert>
      ) : null}

      {data && !data.enabled ? (
        <Alert>
          <AlertTriangle />
          <AlertTitle>Exibição pública desativada</AlertTitle>
          <AlertDescription>
            A curadoria pode ser preparada, mas a landing permanecerá sem
            publicações até INSTAGRAM_CONTENT_ENABLED=true.
          </AlertDescription>
        </Alert>
      ) : null}

      {data ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="size-4" />
                Conta oficial
              </CardTitle>
              <CardDescription>
                A sincronização diária roda automaticamente. Use o botão abaixo
                para forçar uma atualização imediata.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.connected && data.connection ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>@{data.connection.username}</Badge>
                    {data.connection.accountType ? (
                      <Badge variant="outline">{data.connection.accountType}</Badge>
                    ) : null}
                    <Badge variant="secondary">
                      {data.media.length} mídias no catálogo
                    </Badge>
                  </div>

                  <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-foreground">
                        Página do Facebook
                      </dt>
                      <dd>{data.connection.facebookPageName}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">
                        Última sincronização
                      </dt>
                      <dd>
                        {data.connection.lastSyncedAt
                          ? formatDateTime(data.connection.lastSyncedAt)
                          : 'Ainda não sincronizado'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">
                        Token expira em
                      </dt>
                      <dd>{tokenExpiryLabel ?? '—'}</dd>
                    </div>
                  </dl>

                  {data.connection.lastSyncError ? (
                    <Alert variant="destructive">
                      <AlertTriangle />
                      <AlertTitle>Erro na última sincronização</AlertTitle>
                      <AlertDescription>
                        {data.connection.lastSyncError}
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => syncMedia.mutate()}
                      disabled={syncMedia.isPending}
                    >
                      <RefreshCw
                        className={
                          syncMedia.isPending ? 'animate-spin' : undefined
                        }
                      />
                      Sincronizar agora
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => startOAuth.mutate()}
                      disabled={startOAuth.isPending || !data.configured}
                    >
                      Reconectar
                    </Button>
                    {session?.user.role === 'MASTER' ? (
                      <Button
                        variant="destructive"
                        onClick={() => setIsDisconnectOpen(true)}
                        disabled={disconnect.isPending}
                      >
                        <Link2Off />
                        Desconectar
                      </Button>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma conta conectada. Autorize a conta Business da Tessa
                    para começar a sincronizar fotos, carrosséis e capas de
                    Reels.
                  </p>
                  <Button
                    onClick={() => startOAuth.mutate()}
                    disabled={startOAuth.isPending || !data.configured}
                  >
                    <Camera />
                    Conectar Instagram
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <InstagramCurationPanel isConnected={data.connected} />
        </>
      ) : null}

      <AlertDialog open={isDisconnectOpen} onOpenChange={setIsDisconnectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar a conta oficial?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove a conexão, o catálogo e as seleções ativa e em
              rascunho. A seção social ficará vazia até uma nova conexão,
              curadoria e publicação global.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnect.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => disconnect.mutate()}
              disabled={disconnect.isPending}
            >
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
