import { CompanyInformationEditor } from '../components/CompanyInformationEditor'

export function CompanyInformationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Informações da empresa
        </h2>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          Razão social, CNPJ, endereço, e-mail, WhatsApp e telefones exibidos no
          rodapé e na página de contato. Estes dados não são traduzidos.
        </p>
      </div>
      <CompanyInformationEditor />
    </div>
  )
}
