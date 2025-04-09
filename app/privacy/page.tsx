"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
      
      <div className="prose dark:prose-invert">
        <p className="text-lg mb-4">
          Última atualização: 8 de abril de 2025
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introdução</h2>
        <p>
          Esta Política de Privacidade descreve como a MusicCollab coleta, usa e compartilha dados pessoais quando você usa nossa plataforma.
          Ao utilizar a MusicCollab, você concorda com a coleta e uso de informações de acordo com esta política.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Informações que Coletamos</h2>
        <p>
          <strong>Informações de Registro:</strong> Nome, endereço de e-mail, senha, informações sobre experiência musical e preferências.
        </p>
        <p>
          <strong>Conteúdo do Usuário:</strong> Projetos musicais, gravações, comentários e outras informações que você fornece voluntariamente.
        </p>
        <p>
          <strong>Informações de Uso:</strong> Dados sobre como você interage com a plataforma, incluindo logs, endereço IP, tipo de navegador, páginas visitadas e tempos de acesso.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Como Usamos Suas Informações</h2>
        <p>
          Utilizamos suas informações para:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Fornecer, manter e melhorar nossa plataforma</li>
          <li>Processar transações e gerenciar sua conta</li>
          <li>Enviar notificações sobre sua conta e atividades</li>
          <li>Responder a seus comentários e perguntas</li>
          <li>Monitorar e analisar tendências, uso e atividades</li>
          <li>Detectar, prevenir e resolver problemas técnicos e de segurança</li>
          <li>Cumprir com obrigações legais</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Compartilhamento de Informações</h2>
        <p>
          Podemos compartilhar suas informações com:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Outros usuários conforme suas configurações de privacidade e uso da plataforma</li>
          <li>Provedores de serviços que nos auxiliam na operação da plataforma</li>
          <li>Autoridades competentes quando exigido por lei</li>
        </ul>
        <p>
          Não vendemos seus dados pessoais a terceiros.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Segurança</h2>
        <p>
          Implementamos medidas de segurança para proteger seus dados pessoais. No entanto, nenhum método de transmissão pela Internet ou armazenamento eletrônico é 100% seguro, e não podemos garantir a segurança absoluta.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Seus Direitos</h2>
        <p>
          Você tem o direito de:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Acessar e receber uma cópia dos seus dados pessoais</li>
          <li>Retificar dados imprecisos</li>
          <li>Solicitar a exclusão de seus dados pessoais</li>
          <li>Restringir o processamento de seus dados</li>
          <li>Transferir seus dados para outro serviço (portabilidade)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Alterações nesta Política</h2>
        <p>
          Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova política em nossa plataforma e/ou enviando um e-mail.
          É recomendável revisar esta política regularmente para manter-se informado sobre como estamos protegendo suas informações.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contato</h2>
        <p>
          Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade, entre em contato conosco em:
          privacy@musiccollab.com
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