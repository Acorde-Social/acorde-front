import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import "./globals.css"
import { ClientLayout } from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Acorde - Conectando Compositores e Músicos",
  description: "Plataforma para colaboração musical entre compositores e músicos",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 
                               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  const root = document.documentElement;
                  
                  // Aplicar tema
                  if (theme === 'dark') {
                    root.classList.add('dark');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.remove('dark');
                    root.style.colorScheme = 'light';
                  }
                  
                  // Aplicar cores CSS customizadas se existirem
                  const savedPrefs = localStorage.getItem('theme-customization-storage');
                  if (savedPrefs) {
                    const prefs = JSON.parse(savedPrefs);
                    if (prefs.state?.preferences?.primaryColor) {
                      root.style.setProperty('--primary', prefs.state.preferences.primaryColor);
                    }
                    if (prefs.state?.preferences?.layout) {
                      root.classList.add('layout-' + prefs.state.preferences.layout);
                    }
                  }
                } catch (e) {
                  console.error('Theme init error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}