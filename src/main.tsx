import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import './index.css'

const rootElement = document.getElementById('root')

if (!(rootElement instanceof HTMLDivElement)) {
  throw new Error('Elemento raiz da aplicação não foi encontrado.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
