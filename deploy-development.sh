#!/bin/bash

# Script de Deploy para DESENVOLVIMENTO - dev.acorde.social (Frontend)
# Execute: ./deploy-development.sh

set -e

ENV="development"
APP_DIR="/var/www/acorde-front-development"
PM2_NAME="acorde-front-dev"
PORT=4002

echo "🚀 Iniciando deploy de DESENVOLVIMENTO do Frontend..."

# 1. Navegar para o diretório
cd $APP_DIR

# 2. Fazer pull das últimas mudanças
echo "📥 Baixando últimas mudanças do Git..."
git pull origin develop || git pull origin main

# 3. Instalar dependências
echo "📦 Instalando dependências..."
yarn install

# 4. Copiar .env correto
echo "⚙️  Configurando ambiente de desenvolvimento..."
cp .env.development .env.local

# 5. Build da aplicação Next.js
echo "🏗️  Fazendo build da aplicação..."
yarn build

# 6. Reiniciar aplicação com PM2
echo "🔄 Reiniciando aplicação..."
pm2 restart $PM2_NAME || pm2 start yarn --name $PM2_NAME -- start -p $PORT

# 7. Salvar configuração do PM2
pm2 save

echo "✅ Deploy de DESENVOLVIMENTO concluído com sucesso!"
echo "📊 Status da aplicação:"
pm2 status $PM2_NAME
