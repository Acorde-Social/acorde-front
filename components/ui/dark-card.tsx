import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

export function DarkCard({ 
  className, 
  children, 
  ...props 
}: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "dark-card bg-background/60 backdrop-blur-sm border-secondary/50",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}