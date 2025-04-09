import Link from "next/link"
import { Music } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-3">
      <div className="w-full flex flex-col items-center justify-between gap-2 md:h-16 md:flex-row px-4">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <p className="text-xs leading-loose text-center md:text-left">
            &copy; {new Date().getFullYear()} MusicCollab. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
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