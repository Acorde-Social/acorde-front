"use client"

import { useState, useEffect } from "react"
import Image, { type ImageProps } from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string
}

export function LazyImage({ src, alt, fallbackSrc = "/placeholder.svg", className, ...props }: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  useEffect(() => {
    setImageSrc(src)
    setIsLoading(true)
    setError(false)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
    setImageSrc(fallbackSrc)
  }

  return (
    <div className="relative">
      {isLoading && <Skeleton className={`absolute inset-0 ${className}`} />}
      <Image
        src={error ? fallbackSrc : imageSrc}
        alt={alt}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
}

