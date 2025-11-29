# Padrões de Código - Frontend (Next.js 14+ App Router + TypeScript)

## Estrutura de Arquivos

### `acorde-front/`
```
├── app/                      (Páginas - file-based routing automático)
│   ├── (auth)/              (Route groups - não afeta URL)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── projects/
│   │   ├── [id]/           (Dynamic routes: /projects/123)
│   │   │   ├── page.tsx    (Server Component padrão)
│   │   │   ├── loading.tsx (Suspense boundary automático)
│   │   │   └── error.tsx   (Error boundary automático)
│   │   └── page.tsx        (Lista de projetos)
│   ├── layout.tsx          (Root layout - envolve todas as páginas)
│   └── page.tsx            (Home - rota "/")
├── components/             (Componentes reutilizáveis - UI pura)
│   ├── ui/                (Shadcn/ui components - Button, Input, etc)
│   ├── common/            (Shared components - Navbar, Footer, etc)
│   └── projects/          (Feature-specific - ProjectCard, etc)
├── hooks/                 (Custom hooks - lógica de negócio)
│   ├── use-projects.ts   (Hook com lógica de projetos)
│   ├── use-auth.ts       (Hook de autenticação)
│   └── use-toast.ts      (Hook de notificações)
├── schemas/               (Zod schemas + validação + tipos)
│   ├── project-schema.ts (Schema + tipos + initial values)
│   ├── user-schema.ts
│   └── index.ts          (Re-exports organizados)
├── services/              (APENAS API calls - funções puras com Axios)
│   ├── project-service.ts
│   ├── user-service.ts
│   └── auth-service.ts
├── contexts/              (React Context - estado global)
│   ├── auth-context.tsx
│   └── theme-context.tsx
├── types/                 (Types globais não relacionados a schemas)
│   └── index.ts
├── utils/                 (Helpers/utils - funções auxiliares)
│   └── format.ts
└── lib/                   (Configurações e setup)
    ├── api-config.ts     (Axios config, interceptors)
    └── utils.ts          (cn - classnames, etc)
```

**CRÍTICO - Entendendo a estrutura:**

### `app/` = Routes automático (file-based routing)
- ✅ Substitui o `Routes.tsx` do React CRA
- ✅ `page.tsx` = componente da rota
- ✅ Pode ser Server Component (padrão) ou Client Component (`"use client"`)
- ✅ Composição: página importa hooks + components

### `hooks/` = Lógica de negócio (NÃO "containers")
- ✅ Custom hooks reutilizáveis
- ✅ Gerenciamento de estado
- ✅ Chamadas aos services
- ❌ NÃO renderiza componentes (isso é a página em `app/`)

### `schemas/` = Validação + Types (NÃO "Assets")
- ✅ Zod schemas
- ✅ Type inference
- ✅ Initial values para forms
- ❌ NÃO é chamado "Assets" (termo confuso)

**CRÍTICO - Services:**
- ✅ APENAS funções de API retornando Promise (SEM await redundante)
- ✅ Usar `ApiResponse<T>` (tipo do DefaultResponse backend)
- ❌ NUNCA interfaces, enums, types ou re-exports
- ❌ NUNCA classes (usar funções puras)
- ❌ NUNCA `async/await` desnecessário (retornar Promise diretamente)
- Interfaces → `schemas/` ou `types/`
- Enums/Constants → `types/` ou inline com `as const`

```typescript
// types/api.ts
export interface DefaultResponse<T = any, J = any> {
  data?: T
  count?: number
  message?: string
  success_message?: string
  error_message?: string
  timing?: number
  errors?: J
  warning?: string
  info?: string
  extraData?: Record<string, any>
}

export type ApiResponse<T> = AxiosResponse<DefaultResponse<T>>

// services/user-service.ts
import type { ApiResponse } from '@/types/api'
import type { User } from '@/schemas/user-schema'
import axios from 'axios'
import { API_URL } from '@/lib/api-config'

// ✅ CORRETO - Retorna Promise diretamente (SEM await)
export const getUsers = (token: string): Promise<ApiResponse<User[]>> =>
  axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  })

export const getUserById = (id: string, token: string): Promise<ApiResponse<User>> =>
  axios.get(`${API_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

// ✅ CORRETO - Usar await APENAS quando precisa processar
export const getUserWithProcessing = async (
  id: string, 
  token: string
): Promise<User> => {
  const response = await axios.get(`${API_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  // Aqui precisa await porque vai extrair/transformar dados
  return response.data.data!
}

// ❌ INCORRETO - await redundante
export const getUsers = async (token: string) => {
  return await axios.get(...) // ❌ await desnecessário
}
```

**CRÍTICO - Imports:**
- ✅ SEMPRE da fonte original
- ✅ Usar alias `@/` para imports absolutos
- ❌ NUNCA de re-exports
- Remover imports não utilizados

## Arquitetura Next.js
**Server Component (app/) → Client Component → Hook → Service → API**

### Prioridade de Renderização

**IMPORTANTE:** Entenda onde cada coisa roda:

```
┌─────────────────────────────────────────────────────────┐
│  NEXT.JS SERVER (Node.js rodando SSR/SSG)              │
│                                                          │
│  Server Component (padrão - SEM "use client")          │
│  ├─ Roda no servidor Next.js                           │
│  ├─ Gera HTML estático                                 │
│  ├─ ZERO JavaScript enviado ao browser                 │
│  ├─ Pode fazer fetch direto (não expõe credenciais)   │
│  └─ SEO excelente (crawlers veem conteúdo)            │
│                                                          │
│  Client Component (COM "use client")                    │
│  ├─ Renderizado 1x no servidor (SSR)                  │
│  ├─ Hidratado no browser (interativo)                 │
│  ├─ TODO JavaScript enviado ao cliente                 │
│  ├─ useState, useEffect, eventos funcionam             │
│  └─ Necessário para interatividade                     │
└─────────────────────────────────────────────────────────┘
                          ↓
                    HTML + JS mínimo
                          ↓
┌─────────────────────────────────────────────────────────┐
│  BROWSER (Cliente REAL)                                 │
│  ├─ Recebe HTML pronto dos Server Components           │
│  ├─ Hydrata Client Components (ativa interatividade)   │
│  ├─ Executa hooks, eventos, useState                   │
│  └─ Faz requests para API quando necessário            │
└─────────────────────────────────────────────────────────┘
                          ↓
                  API calls quando necessário
                          ↓
┌─────────────────────────────────────────────────────────┐
│  API BACKEND (acorde-api - NestJS separado)            │
│  ├─ Database, autenticação, lógica de negócio          │
│  └─ Completamente separado do Next.js front            │
└─────────────────────────────────────────────────────────┘
```

### Regra de Ouro: "use client" é EXCEÇÃO

**❌ Confusão comum:**
> "Front é cliente, então tudo precisa de 'use client'"

**✅ Realidade:**
> "Next.js tem DOIS ambientes: servidor Node.js (SSR) + browser (cliente).
> Server Components rodam no servidor Next.js, não no browser."

1. **Server Components** (padrão - SEM `"use client"`)
   - Roda no servidor Next.js (Node.js) - no seu servidor de deploy
   - Gera HTML no servidor
   - Zero JavaScript enviado ao browser
   - SEO perfeito (crawlers veem conteúdo)
   - **Use para:** Listagens, perfis, feed, metadata, dados estáticos
   - **Carga no servidor:** Baixa (apenas queries e HTML)
   
2. **Client Components** (APENAS quando necessário - COM `"use client"`)
   - Roda no browser (hardware do usuário)
   - JavaScript completo enviado
   - Hooks funcionam (useState, useEffect)
   - **Use para:** Interatividade, formulários, eventos
   - **OBRIGATÓRIO para:** Áudio/vídeo, gravação, processamento pesado
   - **Carga no servidor:** ZERO (processa no cliente)

```typescript
// ✅ Server Component (padrão - sem "use client")
// Roda no SEU servidor (Hostinger) - processamento leve
// app/projects/page.tsx
import { ProjectsList } from './projects-list'
import { getProjects } from '@/services/project-service'

export default async function ProjectsPage() {
  // ✅ Fetch no servidor - gera HTML pronto (leve, não sobrecarrega)
  const initialProjects = await getProjects()
  
  return (
    <div>
      <h1>Projetos</h1>
      <ProjectsList initialData={initialProjects} />
    </div>
  )
}

// ✅ Client Component (só quando necessário)
// Roda no BROWSER do usuário - usa hardware do cliente
// app/projects/projects-list.tsx
"use client"
import { useState } from 'react'

export function ProjectsList({ initialData }) {
  const [projects, setProjects] = useState(initialData)
  // Lógica interativa aqui (processa no browser do usuário)
  return <div>{/* JSX */}</div>
}

// ✅ CRÍTICO - Processamento pesado (áudio, vídeo, gravação)
// app/studio/page.tsx
"use client"
import dynamic from 'next/dynamic'

// ⚠️ IMPORTANTE: ssr: false = NÃO roda no servidor (economiza recursos)
const AudioRecorder = dynamic(() => import('@/components/audio-recorder'), {
  ssr: false // ❗ Não tenta renderizar no servidor (browser APIs)
})

export default function StudioPage() {
  // ✅ TODO processamento de áudio roda no browser do USUÁRIO
  // ✅ Seu servidor (Hostinger) NÃO processa áudio
  return <AudioRecorder />
}
```

## Hooks Pattern (Lógica de Negócio)

**CRÍTICO:** Use **custom hooks** em `hooks/` para lógica reutilizável

```typescript
// hooks/use-projects.ts
"use client"
import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { getProjects, createProject } from '@/services/project-service'
import type { Project, CreateProjectData } from '@/schemas/project-schema'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()
  const { toast } = useToast()

  const fetchProjects = useCallback(async () => {
    if (!token) return
    
    setLoading(true)
    try {
      const { data } = await getProjects({}, token)
      setProjects(data.data)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar projetos",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [token, toast])

  const handleCreateProject = useCallback(async (projectData: CreateProjectData) => {
    if (!token) return
    
    try {
      const { data } = await createProject(projectData, token)
      setProjects(prev => [data.data, ...prev])
      toast({ title: "Projeto criado com sucesso!" })
      return data.data
    } catch (error: any) {
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }, [token, toast])

  return {
    projects,
    loading,
    fetchProjects,
    createProject: handleCreateProject
  }
}

// ✅ Uso na página
// app/projects/page.tsx
"use client"
export default function ProjectsPage() {
  const { projects, loading, fetchProjects } = useProjects()
  
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])
  
  return <ProjectsList projects={projects} loading={loading} />
}
```

**Quando usar cada abordagem:**
- ✅ **Custom Hook em `hooks/`**: Lógica reutilizável em múltiplas páginas
- ✅ **Hook inline na página**: Lógica específica de uma única página
- ✅ **Server Component**: Dados estáticos, SEO importante (preferir sempre)
- ❌ **useReducer**: Evitar (complexidade desnecessária para a maioria dos casos)

## Ordem Hooks
`useState → useContext → useRouter/useParams → useEffect → useCallback → useMemo → hooks personalizados`

**Next.js específico:**
- `useRouter` (next/navigation) para navegação client-side
- `useParams` para dynamic routes
- `useSearchParams` para query strings
- `usePathname` para pathname atual

## Data Fetching

### Server Components (Preferido)
```typescript
// ✅ Fetch no servidor (padrão Next.js)
async function getProjectData(id: string) {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    cache: 'force-cache', // ou 'no-store' para dados dinâmicos
    next: { revalidate: 60 } // revalidar a cada 60s
  })
  
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectData(params.id)
  return <ProjectDetails project={project} />
}
```

### Client Components (Quando necessário)
```typescript
// ✅ SWR para cache e revalidação
"use client"
import useSWR from 'swr'

export function ProjectsList() {
  const { data, error, isLoading } = useSWR('/api/projects', fetcher)
  
  if (isLoading) return <Loading />
  if (error) return <Error />
  return <div>{data.map(...)}</div>
}

// ✅ React Query (alternativa)
const { data, isLoading } = useQuery(['projects'], fetchProjects)
```

### Server Actions (Mutations)
```typescript
// app/actions/project-actions.ts
'use server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const data = {
    title: formData.get('title'),
    description: formData.get('description')
  }
  
  // Chamar API ou database diretamente
  const project = await db.project.create({ data })
  
  // Revalidar cache
  revalidatePath('/projects')
  
  return project
}

// Uso no componente
"use client"
import { createProject } from '@/app/actions/project-actions'

export function CreateProjectForm() {
  const handleSubmit = async (formData: FormData) => {
    await createProject(formData)
  }
  
  return <form action={handleSubmit}>...</form>
}
```

## State Management - Otimização
**CRÍTICO:** Evitar estados redundantes - usar valores existentes como controle

```typescript
// ❌ INCORRETO - Estado redundante para controlar abertura
const [open, setOpen] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);

const handleOpen = (id: string) => {
  setSelectedId(id);
  setOpen(true);
};
const handleClose = () => {
  setOpen(false);
  setSelectedId(null);
};

<Drawer open={open} entityId={selectedId} onClose={handleClose} />

// ✅ CORRETO - ID controla abertura (single source of truth)
const [selectedId, setSelectedId] = useState<string | null>(null);

const handleOpen = (id: string) => setSelectedId(id);
const handleClose = () => setSelectedId(null);

<Drawer open={Boolean(selectedId)} entityId={selectedId} onClose={handleClose} />
```

**Casos de uso:**
- ✅ Drawers/Modais de detalhes/edição de entidade
- ✅ Quando presença de ID determina visibilidade
- ❌ Drawers de criação (usar `open: boolean`)
- ❌ Múltiplos estados independentes

**Motivos:**
- ✅ Menos código (reduz boilerplate)
- ✅ Single source of truth
- ✅ Impossível ter estados inconsistentes (`open=true` mas `id=null`)
- ✅ Mais performático (menos re-renders)

## Promise Handling
**CRÍTICO:** Componentes ❌ Promises | Hooks ✅ Promises | Services ✅ Retornar Promise sem await

**Services:**
- ✅ Retornar Promise diretamente (SEM await redundante)
- ✅ Usar await APENAS quando precisa processar/transformar resposta
- ❌ await redundante só para retornar

**Hooks:**
- ✅ Preferir `.then/.catch/.finally`
- ⚠️ async/await apenas para chamadas sequenciais dependentes
- ✅ `toast` do Sonner para feedback (não `enqueueSnackbar`)
- ✅ Acessar `response.data.data` (DefaultResponse do backend)
- ✅ Verificar `response.data.message/warning/info`

**Componentes:**
- ❌ `.then/.catch/.finally`, services diretos, useEffect com API
- ✅ Props e callbacks
- ✅ Chamar custom hooks que abstraem as promises

```typescript
// ✅ CORRETO - Service retorna Promise diretamente
// services/project-service.ts
export const getProjects = (token: string): Promise<ApiResponse<Project[]>> =>
  axios.get(`${API_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` }
  })

// ✅ CORRETO - Hook usa .then/.catch e acessa DefaultResponse
// hooks/use-projects.ts
export function useProjects() {
  const { toast } = useToast()
  
  const fetchProjects = useCallback(() => {
    setLoading(true)
    getProjects(token)
      .then((response) => {
        // Acessa response.data.data (DefaultResponse)
        setProjects(response.data.data || [])
        
        // Exibe mensagens se houver
        if (response.data.message) {
          toast({ title: response.data.message })
        }
        if (response.data.warning) {
          toast({ title: response.data.warning, variant: "warning" })
        }
      })
      .catch((error) => {
        toast({ 
          title: "Erro ao carregar projetos", 
          variant: "destructive" 
        })
      })
      .finally(() => setLoading(false))
  }, [token])
  
  return { fetchProjects }
}

// ❌ INCORRETO - await redundante no service
export const getProjects = async (token: string) => {
  return await axios.get(...) // ❌ await desnecessário
}

// ❌ INCORRETO - Promise no componente
export function ProjectsList() {
  useEffect(() => {
    getProjects(token).then(setProjects) // ❌ Service direto
  }, [])
}
          description: error.message,
          variant: "destructive"
        })
      })
      .finally(() => setLoading(false))
  }, [toast])
  
  return { fetchProjects }
}

// ❌ INCORRETO - Promise no componente
export function ProjectsList() {
  useEffect(() => {
    getProjects()
      .then(data => setProjects(data))
      .catch(err => console.error(err))
  }, [])
}
```

## Código Limpo
- ❌ Comentários explicativos (exceto `// TODO`)
- ❌ `console.log`, `console.error` (usar apenas em desenvolvimento)
- ✅ Código auto-explicativo
- ✅ `toast` do Sonner/use-toast para feedback ao usuário

## Componentes Shadcn/ui

- ✅ SEMPRE usar componentes de `@/components/ui/*` (Button, Input, Card, etc)
- ✅ Componentes comuns em `@/components/common/*`
- ❌ NUNCA usar HTML puro para UI (button, input, div estilizado)
- ✅ Tailwind CSS para estilização (não CSS modules ou styled-components)

```typescript
// ✅ CORRETO - Shadcn/ui
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

<Button variant="default" size="lg">
  Criar Projeto
</Button>

// ❌ INCORRETO - HTML puro
<button className="bg-blue-500 px-4 py-2">
  Criar Projeto
</button>
```

**Componentes disponíveis:**
- Form components: Input, Select, Checkbox, RadioGroup, Textarea, Switch
- Layout: Card, Separator, Tabs, Accordion, ScrollArea
- Feedback: Toast, Dialog, AlertDialog, Sheet, Drawer
- Data: Table, DataTable, Badge, Avatar
- Navigation: Button, Link (next/link)

**Loading States:**
- ✅ `<Loader2 className="animate-spin" />` do lucide-react
- ✅ Skeleton components para loading states
- ✅ Suspense boundaries com `loading.tsx`

**Hooks úteis:**
- `useToast` - Notificações toast
- `useAuth` - Autenticação
- `useTheme` - Tema dark/light
- `useMobile` - Detecção de mobile

## Estilização - globals.css

### Arquivo Principal: `app/globals.css`

**CRÍTICO:** O `app/globals.css` é o ÚNICO arquivo de estilos globais do projeto

- ✅ Importado automaticamente no `app/layout.tsx` (root layout)
- ✅ Contém configurações do Tailwind CSS
- ✅ Define CSS custom properties para temas (light/dark)
- ✅ Inclui utilities customizadas reutilizáveis
- ✅ Hydration fixes e sistema de layout
- ❌ NUNCA criar outros arquivos CSS globais
- ❌ NUNCA usar CSS inline (style={{ }}) ou styled-components

### Estrutura do globals.css

```css
/* ✅ Diretivas Tailwind (OBRIGATÓRIAS - não remover) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ CSS Custom Properties - Theming System */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ...outras variáveis de tema */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ...variáveis dark mode */
  }
}

/* ✅ Utility Classes Customizadas - Reutilizáveis */
@layer utilities {
  .bg-music-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .text-gradient {
    @apply bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent;
  }
  
  .card-hover {
    @apply transition-all hover:shadow-lg hover:scale-[1.02];
  }
  
  .dark-glow {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }
}

/* ✅ Layout System - Variáveis CSS */
:root {
  --header-height: 64px;
  --sidebar-width: 280px;
  --content-max-width: 1200px;
}

/* ✅ Hydration Fixes */
html:not(.hydrated) [data-hide-before-hydration] {
  visibility: hidden;
}
```

### Quando Modificar o globals.css

**✅ Adicione ao globals.css:**
- Utility classes que serão usadas em MÚLTIPLOS componentes
- Animações customizadas globais (keyframes)
- Variáveis CSS para temas (cores, espaçamentos)
- Fixes de hidratação do Next.js
- Estilos de reset/normalize específicos do projeto

```css
/* ✅ CORRETO - Utility reutilizável */
@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--primary)) transparent;
  }
  
  .audio-wave-animation {
    animation: wave 1.2s linear infinite;
  }
  
  @keyframes wave {
    0%, 100% { transform: scaleY(0.5); }
    50% { transform: scaleY(1); }
  }
}
```

**❌ NÃO adicione ao globals.css:**
- Estilos específicos de um único componente
- Estilos que podem ser feitos com Tailwind
- CSS inline (style prop)
- Módulos CSS separados

```typescript
// ❌ INCORRETO - CSS inline
<div style={{ backgroundColor: 'blue', padding: '16px' }}>
  Conteúdo
</div>

// ❌ INCORRETO - Criar arquivo CSS separado
import './my-component.css'

// ✅ CORRETO - Tailwind classes
<div className="bg-blue-500 p-4">
  Conteúdo
</div>

// ✅ CORRETO - Utility do globals.css
<div className="bg-music-gradient p-4">
  Conteúdo
</div>
```

### Padrão de Uso

**Prioridade de estilização:**

1. **Tailwind Classes** (primeira opção)
   ```typescript
   <div className="flex items-center gap-4 p-6 bg-white dark:bg-slate-900">
   ```

2. **Utilities do globals.css** (quando Tailwind não é suficiente)
   ```typescript
   <div className="card-hover bg-music-gradient">
   ```

3. **CSS Custom Properties** (para temas dinâmicos)
   ```typescript
   <div style={{ 
     height: 'calc(100vh - var(--header-height))' 
   }}>
   ```

4. **Criar nova utility no globals.css** (quando vai reutilizar em 3+ lugares)
   ```css
   /* Adicione em @layer utilities */
   .studio-panel {
     @apply bg-slate-900 border border-slate-800 rounded-lg p-4;
   }
   ```

### Regras CRÍTICAS

- ✅ **Tailwind-first:** Use Tailwind sempre que possível
- ✅ **DRY:** Se repetir estilos 3+ vezes, crie utility no globals.css
- ✅ **Semantic naming:** Nomes descritivos (`.audio-wave`, não `.purple-bg`)
- ✅ **@layer utilities:** Sempre adicione utilities em `@layer utilities`
- ✅ **Theming:** Use CSS custom properties para valores que mudam com tema
- ❌ **Zero CSS inline:** Nunca use `style={{ }}` (exceto cálculos dinâmicos)
- ❌ **Zero CSS modules:** Não criar arquivos `.module.css`
- ❌ **Zero styled-components:** Não usar CSS-in-JS
- ❌ **Zero arquivos CSS separados:** Apenas `app/globals.css` é permitido

### Exemplo Real - Studio de Áudio

```css
/* app/globals.css */
@layer utilities {
  /* ✅ Utilities para studio de áudio */
  .waveform-container {
    @apply relative w-full h-24 bg-slate-950 rounded-lg overflow-hidden;
  }
  
  .track-item {
    @apply flex items-center gap-3 p-3 rounded-lg;
    @apply bg-slate-900/50 hover:bg-slate-900 transition-colors;
    @apply border border-slate-800 hover:border-primary/50;
  }
  
  .mixer-knob {
    @apply relative w-16 h-16 rounded-full bg-slate-800;
    @apply border-2 border-slate-700 cursor-pointer;
    @apply hover:border-primary transition-all;
  }
}
```

```typescript
// components/studio/track-list.tsx
"use client"
export function TrackList({ tracks }: Props) {
  return (
    <div className="space-y-2">
      {tracks.map(track => (
        <div key={track.id} className="track-item">
          <div className="waveform-container">
            {/* Waveform component */}
          </div>
          <div className="mixer-knob">
            {/* Knob component */}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Manutenção

**Ao adicionar nova utility:**
1. Verificar se já existe similar
2. Nome semântico e descritivo
3. Adicionar em `@layer utilities`
4. Documentar se complexa (comentário acima)
5. Testar dark mode se aplicável

**Ao modificar tema:**
1. Editar CSS custom properties em `:root` e `.dark`
2. Nunca hardcode valores de cor (usar `hsl(var(--primary))`)
3. Testar light e dark mode

## Schemas (Zod Validation + Types)

**CRÍTICO:** `schemas/` = Zod schemas + tipos inferidos + valores iniciais

**Por quê "schemas" ao invés de "Assets"?**
- ✅ Termo mais claro e específico (validação de dados)
- ✅ Padrão da comunidade Next.js/Zod
- ❌ "Assets" é ambíguo (pode ser imagens, fontes, etc)

```typescript
// schemas/project-schema.ts
import { z } from 'zod'

// ✅ Schemas Zod (validação)
export const createProjectSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  genre: z.string().min(1, "Selecione um gênero"),
  bpm: z.number().min(40).max(220),
  key: z.string(),
  neededInstruments: z.array(z.string()).min(1, "Adicione pelo menos um instrumento")
})

export const updateProjectSchema = createProjectSchema.partial()

// ✅ Type inference do Zod (DRY - não duplicar interfaces)
export type CreateProjectData = z.infer<typeof createProjectSchema>
export type UpdateProjectData = z.infer<typeof updateProjectSchema>

// ✅ Valores iniciais para formulários
export const createProjectInitialValues: CreateProjectData = {
  title: "",
  description: "",
  genre: "",
  bpm: 120,
  key: "C Major",
  neededInstruments: []
}

// ✅ Interfaces adicionais (quando Zod não é suficiente)
export interface ProjectWithAuthor extends CreateProjectData {
  id: string
  author: {
    id: string
    name: string
    avatarUrl?: string
  }
  createdAt: Date
  updatedAt: Date
}

// ✅ Constants com as const (melhor que enums)
export const ProjectStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus]
```

**Uso com React Hook Form:**
```typescript
"use client"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProjectSchema, createProjectInitialValues } from '@/schemas/project-schema'

export function CreateProjectForm() {
  const form = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: createProjectInitialValues
  })
  
  const onSubmit = (data: CreateProjectData) => {
    // data já está validado e tipado
  }
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

**Regras Schemas:**
- ✅ Zod schemas para validação de formulários
- ✅ Type inference (`z.infer<typeof schema>`) ao invés de interfaces duplicadas
- ✅ Initial values para cada schema
- ✅ Interfaces adicionais quando necessário (relações, dados da API)
- ✅ Um arquivo por entidade (project-schema.ts, user-schema.ts)
- ❌ Helpers/utils NÃO vão em schemas (criar `utils/`)
- ❌ Constantes de UI NÃO vão em schemas (criar `constants/` ou inline)

## Next.js Otimizações

### Image Optimization
```typescript
import Image from 'next/image'

// ✅ SEMPRE usar Next Image
<Image 
  src="/project-image.jpg"
  alt="Project"
  fill // ou width/height
  className="object-cover"
  priority // para imagens above-the-fold
/>

// ❌ NUNCA usar <img> direto
<img src="/project-image.jpg" alt="Project" />
```

### Link Navigation
```typescript
import Link from 'next/link'

// ✅ SEMPRE usar Next Link
<Link href="/projects/123">Ver Projeto</Link>

// ❌ NUNCA usar <a> para rotas internas
<a href="/projects/123">Ver Projeto</a>
```

### Metadata e SEO
```typescript
// app/projects/[id]/page.tsx
import type { Metadata } from 'next'

// ✅ Metadata estática
export const metadata: Metadata = {
  title: 'Projetos - Acorde',
  description: 'Colabore em projetos musicais'
}

// ✅ Metadata dinâmica
export async function generateMetadata({ params }): Promise<Metadata> {
  const project = await getProject(params.id)
  
  return {
    title: `${project.title} - Acorde`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.imageUrl]
    }
  }
}
```

### Loading e Error States
```typescript
// app/projects/loading.tsx (Suspense boundary automático)
export default function Loading() {
  return <ProjectsSkeleton />
}

// app/projects/error.tsx (Error boundary automático)
'use client'
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Algo deu errado!</h2>
      <button onClick={reset}>Tentar novamente</button>
    </div>
  )
}
```

## JSX e Performance
**CRÍTICO:** ❌ NUNCA criar consts/funções dentro do JSX (map, render, etc)

```typescript
// ❌ INCORRETO - Criação dentro do JSX
{items.map((item) => {
  const isActive = item.status === 'active';
  const config = getConfig(item.id);
  return <Component isActive={isActive} {...config} />;
})}

// ✅ CORRETO - Lógica antes do JSX ou em useCallback/useMemo
const processedItems = useMemo(() => 
  items.map(item => ({
    ...item,
    isActive: item.status === 'active',
    config: getConfig(item.id),
  })), [items]);

{processedItems.map((item) => (
  <Component isActive={item.isActive} {...item.config} />
))}
```

**Motivos:**
- ✅ Melhor performance (evita recriação a cada render)
- ✅ Código mais legível
- ✅ Facilita debugging
- ✅ Separação clara: lógica → apresentação

## Performance e Lazy Loading

### Dynamic Imports

**CRÍTICO para Acorde (rede social de músicos):**

```typescript
// ✅ Lazy load de componentes pesados (áudio, vídeo, gravação)
import dynamic from 'next/dynamic'

// ⚠️ SEMPRE use ssr: false para componentes que:
// - Processam áudio/vídeo
// - Usam getUserMedia (gravação)
// - Usam Web Audio API
// - Usam Canvas/WebGL
// - Fazem processamento pesado
const StudioEditor = dynamic(() => import('@/components/studio/editor'), {
  loading: () => <Loader2 className="animate-spin" />,
  ssr: false // ❗ CRÍTICO - não roda no servidor (economiza recursos)
})

const AudioRecorder = dynamic(() => import('@/components/audio-recorder'), {
  ssr: false // ❗ Browser APIs (getUserMedia) não existem no servidor
})

const Waveform = dynamic(() => import('@/components/waveform'), {
  ssr: false // ❗ Canvas só existe no browser
})

export default function StudioPage() {
  // ✅ Todo processamento roda no hardware do USUÁRIO
  // ✅ Seu servidor (Hostinger) só entrega HTML inicial
  return <StudioEditor />
}
```

### useMemo e useCallback
```typescript
// ✅ Memorizar computações pesadas
const filteredProjects = useMemo(() => 
  projects.filter(p => p.genre === selectedGenre),
  [projects, selectedGenre]
)

// ✅ Memorizar callbacks para evitar re-renders
const handleClick = useCallback((id: string) => {
  router.push(`/projects/${id}`)
}, [router])
```

### React.memo para componentes puros
```typescript
// ✅ Evitar re-renders desnecessários
export const ProjectCard = React.memo(({ project }: Props) => {
  return <Card>...</Card>
})
```

## Regras Gerais

- ✅ Arrow functions
- ✅ Campos opcionais SEMPRE por último
- ✅ Tipos explícitos (❌ any)
- ✅ `useCallback`/`useMemo` para performance
- ✅ `"use client"` APENAS quando necessário (interatividade)
- ✅ Preferir Server Components quando possível (listagens, perfis, SEO)
- ✅ **SEMPRE** `ssr: false` para áudio/vídeo/gravação/processamento pesado
- ❌ Instalar libs sem verificar package.json
- ✅ Usar `@/` para imports absolutos

### Regras CRÍTICAS para Performance (Rede Social de Músicos)

**⚠️ Para NÃO sobrecarregar seu servidor:**

1. **Server Components** (HTML leve - OK para servidor)
   - ✅ Listagens (projetos, usuários, tracks)
   - ✅ Perfis estáticos
   - ✅ Feed de posts
   - ✅ Metadata/SEO
   - **Carga:** Baixa (apenas queries SQL)

2. **Client Components com `"use client"`** (interatividade - OK)
   - ✅ Formulários
   - ✅ Botões interativos
   - ✅ Modais/Dialogs
   - **Carga:** Zero no servidor (JS roda no browser)

3. **Dynamic Import com `ssr: false`** (processamento pesado - OBRIGATÓRIO)
   - ✅ **Gravação de áudio** (getUserMedia)
   - ✅ **Processamento de áudio** (Web Audio API)
   - ✅ **Player de áudio** (waveforms)
   - ✅ **Studio/DAW** (mixing, effects)
   - ✅ **Upload de arquivos** (direto para R2/S3)
   - ✅ **Websockets** (chat tempo real)
   - ✅ **Canvas** (visualizações)
   - **Carga:** ZERO no servidor (processa no hardware do usuário)

```typescript
// ❌ NUNCA fazer processamento pesado no servidor
export default async function StudioPage() {
  const audio = await processAudio() // ❌ SOBRECARREGA!
  return <Player audio={audio} />
}

// ✅ SEMPRE processar no browser do usuário
"use client"
export default function StudioPage() {
  return (
    <AudioProcessor /> // ✅ Processa no cliente
  )
}

// ✅ MELHOR - Lazy load com ssr: false
export default function StudioPage() {
  const AudioStudio = dynamic(() => import('@/components/audio-studio'), {
    ssr: false // ❗ Não carrega no servidor
  })
  
  return <AudioStudio /> // ✅ Zero carga no servidor
}
```

### TypeScript Strict Mode
```typescript
// ✅ Sempre tipar explicitamente
const [user, setUser] = useState<User | null>(null)
const projects: Project[] = []

// ❌ Evitar any
const data: any = await fetch() // ❌
const data: ApiResponse<Project[]> = await fetch() // ✅

// ✅ Type guards
function isProject(obj: unknown): obj is Project {
  return typeof obj === 'object' && obj !== null && 'id' in obj
}
```

### Enums vs Const Objects
**CRÍTICO:** SEMPRE usar `const objects` ou `as const` (melhor tree-shaking)

```typescript
// ❌ INCORRETO - Enum tradicional (gera código extra)
enum EntityType {
  USER,
  BRANCH,
  COMPANY,
}

// ✅ CORRETO - Const object com as const
export const EntityType = {
  USER: 'user',
  BRANCH: 'branch',
  COMPANY: 'company',
} as const

export type EntityType = typeof EntityType[keyof typeof EntityType]

// ✅ Uso
interface Props {
  type: EntityType
}

const type = EntityType.USER // type-safe e autocomplete
```

**Motivos:**
- ✅ Type-safe (sem erros de digitação)
- ✅ Melhor tree-shaking (menos bundle size)
- ✅ Valores em runtime (enums tradicionais são removidos)
- ✅ Refatoração segura
- ✅ Autocomplete
- ✅ Consistência Backend ↔ Frontend

### Git Commits
**CRÍTICO:** Commits SEMPRE em inglês e descritivos

```
feat: add lot control drawer component

- Create LotControlDrawer component with form validation
- Implement lot selection logic with FIFO strategy
- Add Yup schema for lot control validation
- Integrate with lot control service endpoints
```

**Regras:**
- ✅ Inglês (padrão internacional)
- ✅ Primeiro linha: resumo (tipo: descrição curta)
- ✅ Tipos: `feat`, `fix`, `refactor`, `perf`, `docs`, `chore`, `style`
- ✅ Bullet points detalhando mudanças principais
- ✅ Incluir contexto técnico relevante

## Context API e State Management

### Context Pattern
```typescript
// contexts/auth-context.tsx
"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Lógica de autenticação aqui
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// ✅ Hook customizado para usar o context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Uso no layout
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### Zustand (Alternativa para estado global)
```typescript
// store/use-projects-store.ts
import { create } from 'zustand'

interface ProjectsStore {
  projects: Project[]
  loading: boolean
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
}

export const useProjectsStore = create<ProjectsStore>((set) => ({
  projects: [],
  loading: false,
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ 
    projects: [project, ...state.projects] 
  }))
}))

// Uso
const { projects, addProject } = useProjectsStore()
```

## Environment Variables

```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
DATABASE_URL=postgresql://...
SECRET_KEY=...

// ✅ Variáveis públicas (acessíveis no cliente)
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// ✅ Variáveis privadas (apenas no servidor)
const dbUrl = process.env.DATABASE_URL // Só funciona em Server Components
```

## Checklist

### Criando uma nova feature
- [ ] Criar schema Zod em `schemas/[entity]-schema.ts`
- [ ] Criar funções de service puras em `services/[entity]-service.ts`
- [ ] Criar custom hook em `hooks/use-[entity].ts` (se necessário)
- [ ] Criar componentes UI em `components/[entity]/`
- [ ] Criar página em `app/[entity]/page.tsx` (preferir Server Component)
- [ ] Adicionar tipos em `types/` (se globais e não relacionados a schemas)
- [ ] Adicionar metadata para SEO
- [ ] Adicionar loading.tsx e error.tsx
- [ ] Otimizar imagens com Next Image
- [ ] Testar responsividade (mobile-first)

### Code Review
- [ ] Services: apenas funções puras + Axios (não classes)
- [ ] Schemas: Zod + type inference (não duplicar interfaces)
- [ ] Hooks: em `hooks/` para lógica reutilizável
- [ ] Componentes: Shadcn/ui (não HTML puro)
- [ ] "use client" apenas quando necessário (interatividade)
- [ ] Preferir Server Components (listagens, SEO)
- [ ] **`ssr: false` para áudio/vídeo/gravação (OBRIGATÓRIO)**
- [ ] Upload de arquivos: direto para R2/S3 (não passar pelo Next.js)
- [ ] Processamento pesado: sempre no browser (não no servidor)
- [ ] Type-safe (sem `any`)
- [ ] Imports com `@/` alias
- [ ] Sem console.log
- [ ] Toast para feedback ao usuário
- [ ] Git commit em inglês

### Checklist Performance (Evitar Sobrecarga do Servidor)
- [ ] Componentes de áudio/vídeo: usar `dynamic` com `ssr: false`
- [ ] Gravação: `getUserMedia` apenas em Client Components
- [ ] Processamento: Web Audio API apenas no browser
- [ ] Upload: direto para R2/S3 (não passar pelo servidor Next.js)
- [ ] Websockets: conexão direta do browser para API
- [ ] Server Components: apenas para HTML leve (listagens, perfis)

---

**Docs:** 
- [Next.js 14](https://nextjs.org/docs)
- [React 18](https://react.dev/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Zod](https://zod.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

**Última atualização:** 2025-11-29 | **Responsável:** Diego Fortunato Raimundo
