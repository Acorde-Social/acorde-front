import { Hero } from "@/components/landing/hero"
import { redirect } from "next/navigation"
import { SuccessStories } from "@/components/landing/success-stories"
import { Features } from "@/components/landing/features"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"
import { FinalCTA } from "@/components/landing/final-cta"
import { LandingAuthRedirect } from "@/components/landing/landing-auth-redirect"
import { cookies } from 'next/headers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acorde - Rede Social para Músicos',
  description: 'Conecte-se com artistas, colabore em projetos musicais e expanda seu network.',
  openGraph: {
    title: 'Acorde',
    images: ['/og-image.jpg'],
  },
}

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (token) redirect('/home')

  return (
    <>
      <LandingAuthRedirect />

      <Hero/>
      <div className="bg-gradient-to-b from-background via-background to-muted/30">
        <Features />
      </div>

      <div className="bg-gradient-to-b from-background via-background to-muted/30">
        <FAQ />
      </div>

      <div className="bg-gradient-to-b from-background via-background to-muted/30">
        <FinalCTA/>
      </div>

    </>
  )
}
