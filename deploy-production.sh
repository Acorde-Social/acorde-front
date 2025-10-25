#!/bin/bash

# Script de Deploy para PRODUÇÃO - acorde.social (Frontend)
# Execute: ./deploy-production.sh

set -e

ENV="production"
APP_DIR="/var/www/acorde-front-production"
PM2_NAME="acorde-front-prod"
PORT=4001

echo "🚀 Iniciando deploy de PRODUÇÃO do Frontend..."

# 1. Navegar para o diretório
cd $APP_DIR

# 2. Fazer pull das últimas mudanças
echo "📥 Baixando últimas mudanças do Git..."
git pull origin main

# 3. Instalar dependências
echo "📦 Instalando dependências..."
yarn install --production=false

# 4. Copiar .env correto
echo "⚙️  Configurando ambiente de produção..."
cp .env.production .env.local

# 5. Build da aplicação Next.js
echo "🏗️  Fazendo build da aplicação..."
yarn build

# 6. Reiniciar aplicação com PM2
echo "🔄 Reiniciando aplicação..."
pm2 restart $PM2_NAME || pm2 start yarn --name $PM2_NAME -- start -p $PORT

# 7. Salvar configuração do PM2
pm2 save

echo "✅ Deploy de PRODUÇÃO concluído com sucesso!"
echo "📊 Status da aplicação:"
pm2 status $PM2_NAME
