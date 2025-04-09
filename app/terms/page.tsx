"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
      
      <div className="prose dark:prose-invert">
        <p className="text-lg mb-4">
          Última atualização: 8 de abril de 2025
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introdução</h2>
        <p>
          Bem-vindo ao MusicCollab. Estes Termos de Serviço regem seu uso da plataforma MusicCollab, incluindo todos os recursos, funcionalidades, aplicativos, e serviços associados.
          Ao acessar ou usar o MusicCollab, você concorda em cumprir estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não poderá acessar ou usar a plataforma.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Definições</h2>
        <p>
          <strong>"Plataforma"</strong> refere-se ao website, aplicativos, e serviços MusicCollab.<br />
          <strong>"Usuário"</strong> refere-se a qualquer pessoa que acesse ou use a Plataforma.<br />
          <strong>"Conteúdo"</strong> refere-se a músicas, composições, gravações, projetos, comentários, e quaisquer outros materiais enviados à Plataforma.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Registro de Conta</h2>
        <p>
          Para usar certos recursos da Plataforma, você precisa criar uma conta. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta.
          Você concorda em fornecer informações precisas e completas durante o processo de registro e manter essas informações atualizadas.
          A MusicCollab reserva-se o direito de suspender ou encerrar contas que violem estes Termos.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Propriedade Intelectual</h2>
        <p>
          Ao enviar Conteúdo para a Plataforma, você mantém todos os direitos de propriedade intelectual sobre esse Conteúdo.
          No entanto, você concede à MusicCollab uma licença mundial, não exclusiva, livre de royalties para uso, reprodução, modificação, adaptação, publicação, tradução, e distribuição desse Conteúdo na Plataforma e em materiais promocionais relacionados.
          Esta licença termina quando você remove seu Conteúdo da Plataforma, exceto quando o Conteúdo foi compartilhado com outros usuários que não o removeram.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Direitos e Restrições dos Usuários</h2>
        <p>
          Você pode usar a Plataforma apenas para fins legais e de acordo com estes Termos.
          Você não pode usar a Plataforma para violar leis ou regulamentos, infringir direitos de propriedade intelectual, distribuir malware, assediar outros usuários, ou prejudicar a operação da Plataforma.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Termos de Colaboração</h2>
        <p>
          Ao colaborar em projetos com outros usuários, você concorda que todos os colaboradores mantêm direitos sobre suas respectivas contribuições.
          Os termos específicos de cada colaboração devem ser acordados entre os colaboradores e a MusicCollab não se responsabiliza por disputas relacionadas a colaborações.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Modificações</h2>
        <p>
          A MusicCollab se reserva o direito de modificar estes Termos a qualquer momento. Alterações significativas serão notificadas aos usuários através da Plataforma ou por email.
          Seu uso continuado da Plataforma após tais modificações constitui aceitação dos novos Termos.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Disposições Gerais</h2>
        <p>
          Estes Termos constituem o acordo completo entre você e a MusicCollab e substituem todos os acordos anteriores.
          Se qualquer disposição destes Termos for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.
        </p>

        <div className="mt-12">
          <Link href="/register">
            <Button>Voltar ao Registro</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}