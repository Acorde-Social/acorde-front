import Link from "next/link"
import { Music } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <p className="text-sm leading-loose text-center md:text-left">
            &copy; {new Date().getFullYear()} MusicCollab. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/terms" className="text-muted-foreground hover:text-foreground">
            Termos
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
            Privacidade
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">
            Contato
          </Link>
        </div>
      </div>
    </footer>
  )
}