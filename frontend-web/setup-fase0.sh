#!/bin/bash

# Script de instalación de dependencias para Fase 0 Frontend
# Ejecutar: bash setup-fase0.sh

echo "🚀 Instalando dependencias para Fase 0 Frontend..."

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando todas las dependencias..."
  npm install
else
  echo "✅ node_modules ya existe"
fi

# Verificar si dexie está instalado
if ! grep -q '"dexie"' package.json; then
  echo "📦 Instalando Dexie.js..."
  npm install dexie
else
  echo "✅ Dexie.js ya está en package.json"
fi

# Verificar si axios está instalado
if ! grep -q '"axios"' package.json; then
  echo "📦 Instalando axios..."
  npm install axios
else
  echo "✅ axios ya está en package.json"
fi

# Crear .env.local si no existe
if [ ! -f ".env.local" ]; then
  echo "📝 Creando .env.local desde .env.example..."
  cp .env.example .env.local
  echo "⚠️ IMPORTANTE: Edita .env.local con tus valores:"
  echo "   REACT_APP_API_URL"
  echo "   REACT_APP_SYNC_URL"
  echo "   REACT_APP_DEVICE_ID"
else
  echo "✅ .env.local ya existe"
fi

echo ""
echo "✅ Fase 0 setup completado!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita .env.local con tus valores"
echo "2. Ejecuta: npm start"
echo "3. Abre http://localhost:3000"
echo ""
