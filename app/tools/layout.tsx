import { Metadata } from "next"
import { Suspense } from "react"
import { AsyncBoundary } from "@/components/async-boundary"

export const metadata: Metadata = {
  title: "Ferramentas de Áudio | Music Collab",
  description: "Ferramentas para processamento de áudio e música",
}

interface ToolsLayoutProps {
  children: React.ReactNode
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <AsyncBoundary>
      <div className="min-h-screen">
        {children}
      </div>
    </AsyncBoundary>
  )
}