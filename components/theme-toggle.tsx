"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative overflow-hidden hover:bg-primary/5 transition-all duration-300"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Alternar tema</span>
        
        {/* Efeito de brilho em volta do ícone no modo escuro */}
        <span className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-20 bg-primary/20 rounded-full scale-0 dark:scale-[2] blur-lg transition-all duration-500"></span>
      </Button>
    </div>
  )
}