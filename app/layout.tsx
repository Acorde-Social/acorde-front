import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import "./globals.css"
import { ClientLayout } from "./client-layout"

const inter = Inter({ subsets: ["latin"] })
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
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

                  if (theme === 'dark') {
                    root.classList.add('dark');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.remove('dark');
                    root.style.colorScheme = 'light';
                  }

                  const savedPrefs = localStorage.getItem('theme-customization-storage');
                  if (savedPrefs) {
                    const prefs = JSON.parse(savedPrefs);

                    if (prefs.state?.preferences?.layout) {
                      root.classList.add('layout-' + prefs.state.preferences.layout);
                    }
                  }
                } catch (e) {
                }
              })();
            `,
          }}
        />
      </head>
      <body className={cn("min-h-screen bg-muted font-sans antialiased", inter.className)}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
