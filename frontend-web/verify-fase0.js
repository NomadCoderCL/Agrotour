/**
 * Quick Verification Script - Verifica que Fase 0 esté lista
 * Ejecutar en console: node verify-fase0.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando Fase 0 Frontend Setup...\n');

const checks = [
  {
    name: 'TypeScript types',
    file: 'src/types/models.ts',
  },
  {
    name: 'HTTP Client',
    file: 'src/services/api.ts',
  },
  {
    name: 'IndexedDB (Dexie)',
    file: 'src/services/db.ts',
  },
  {
    name: 'Sync Client',
    file: 'src/services/sync.ts',
  },
  {
    name: 'Service Worker',
    file: 'public/service-worker.ts',
  },
  {
    name: 'SW Registration',
    file: 'src/services/serviceWorker.ts',
  },
  {
    name: 'Sync Hooks',
    file: 'src/hooks/useSync.ts',
  },
  {
    name: 'Logger',
    file: 'src/lib/logger.ts',
  },
  {
    name: 'Configuration',
    file: 'src/config/env.ts',
  },
  {
    name: 'Environment template',
    file: '.env.example',
  },
  {
    name: 'Barrel export (types)',
    file: 'src/types/index.ts',
  },
  {
    name: 'Barrel export (services)',
    file: 'src/services/index.ts',
  },
  {
    name: 'Barrel export (hooks)',
    file: 'src/hooks/index.ts',
  },
  {
    name: 'Barrel export (config)',
    file: 'src/config/index.ts',
  },
  {
    name: 'Barrel export (lib)',
    file: 'src/lib/index.ts',
  },
];

let allPassed = true;

checks.forEach((check) => {
  const filePath = path.join(__dirname, check.file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${check.name}: ${check.file}`);
  if (!exists) allPassed = false;
});

console.log('\n📦 Verificando dependencias en package.json...\n');

const packageJson = require('./package.json');
const requiredDeps = ['dexie', 'axios', 'react', 'typescript'];

requiredDeps.forEach((dep) => {
  const exists =
    packageJson.dependencies[dep] || packageJson.devDependencies[dep];
  const status = exists ? '✅' : '⚠️';
  console.log(`${status} ${dep}${exists ? ` (${exists})` : ' (no instalado)'}`);
  if (!exists && dep !== 'dexie') allPassed = false;
});

console.log('\n🔧 Verificando configuración...\n');

const envExists = fs.existsSync('.env.local');
const envExampleExists = fs.existsSync('.env.example');

console.log(`${envExampleExists ? '✅' : '❌'} .env.example`);
console.log(`${envExists ? '✅' : '⚠️'} .env.local ${envExists ? '' : '(crear desde .env.example)'}`);

console.log('\n' + (allPassed ? '✅ FASE 0 LISTA!' : '⚠️ COMPLETAR FASE 0'));
console.log('\nPróximos pasos:');
console.log('1. npm install dexie (si falta)');
console.log('2. cp .env.example .env.local');
console.log('3. Editar .env.local con valores de tu ambiente');
console.log('4. npm start');
