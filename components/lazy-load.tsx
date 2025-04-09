"use client"

import { Suspense, lazy, type ComponentType, type ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface LazyLoadProps {
  component: () => Promise<{ default: ComponentType<any> }>
  props?: Record<string, any>
  fallback?: ReactNode
}

export function LazyLoad({ component, props = {}, fallback }: LazyLoadProps) {
  const LazyComponent = lazy(component)

  return (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

function LoadingFallback() {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

