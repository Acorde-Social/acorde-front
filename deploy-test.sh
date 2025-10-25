#!/bin/bash

# Script de Deploy para TESTE - tst.acorde.social (Frontend)
# Execute: ./deploy-test.sh

set -e

ENV="test"
APP_DIR="/var/www/acorde-front-test"
PM2_NAME="acorde-front-test"
PORT=4003

echo "🚀 Iniciando deploy de TESTE do Frontend..."

# 1. Navegar para o diretório
cd $APP_DIR

# 2. Fazer pull das últimas mudanças
echo "📥 Baixando últimas mudanças do Git..."
git pull origin test || git pull origin develop || git pull origin main

# 3. Instalar dependências
echo "📦 Instalando dependências..."
yarn install

# 4. Copiar .env correto
echo "⚙️  Configurando ambiente de teste..."
cp .env.test .env.local

# 5. Build da aplicação Next.js
echo "🏗️  Fazendo build da aplicação..."
yarn build

# 6. Reiniciar aplicação com PM2
echo "🔄 Reiniciando aplicação..."
pm2 restart $PM2_NAME || pm2 start yarn --name $PM2_NAME -- start -p $PORT

# 7. Salvar configuração do PM2
pm2 save

echo "✅ Deploy de TESTE concluído com sucesso!"
echo "📊 Status da aplicação:"
pm2 status $PM2_NAME
