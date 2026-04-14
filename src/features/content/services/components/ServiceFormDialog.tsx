import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { ServiceForm } from './ServiceForm'
import type { ServicePageFormData } from '../types'

interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  onSubmit: (data: ServicePageFormData) => void
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: ServiceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90dvh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Novo serviço</DialogTitle>
          <DialogDescription>
            Preencha os dados da nova página de serviço.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          <ServiceForm
            formId="service-create-form"
            isPending={isPending}
            submitLabel="Criar"
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            resetKey={open ? 'open' : 'closed'}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
