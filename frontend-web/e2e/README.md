# E2E Tests con Playwright

## Configuración

Playwright está configurado para ejecutar tests contra `http://localhost:3000`.

### Archivos de Test

- **home.spec.ts** - Tests de la página de inicio
  - Carga de página
  - Navegación
  - Disponibilidad de componentes principales

- **auth.spec.ts** - Tests de autenticación
  - Página de login
  - Página de registro
  - Validación de formularios
  - Navegación entre pages de auth

- **products.spec.ts** - Tests de exploración de productos
  - Carga de página de productos
  - Filtros y búsqueda
  - Detalles de productos

- **cart.spec.ts** - Tests del carrito de compras
  - Agregar/remover productos
  - Actualizar cantidades
  - Persistencia en localStorage
  - Navegación a checkout

- **checkout.spec.ts** - Tests del checkout
  - Carga de página
  - Formulario de envío
  - Métodos de pago
  - Resumen de orden

- **darkmode.spec.ts** - Tests del dark mode
  - Toggle de dark mode
  - Persistencia de preferencia
  - Aplicación de estilos

- **offline.spec.ts** - Tests del modo offline
  - Indicadores de offline
  - Navegación offline
  - Sincronización de datos
  - Uso de caché

## Ejecución

### Ejecutar todos los tests
```bash
npm run test:e2e
```

### Ejecutar con UI interactivo
```bash
npm run test:e2e:ui
```

### Ejecutar en modo debug
```bash
npm run test:e2e:debug
```

### Ejecutar con navegadores visibles
```bash
npm run test:e2e:headed
```

### Ejecutar un archivo de test específico
```bash
npx playwright test e2e/home.spec.ts
```

### Ejecutar un test específico
```bash
npx playwright test -g "debería cargar la página de inicio"
```

## Requisitos previos

1. **Dev server corriendo:**
   ```bash
   npm start
   ```
   El servidor debe estar en `http://localhost:3000`

2. **Dependencias instaladas:**
   ```bash
   npm install -D @playwright/test
   ```

## Notas Importantes

- Los tests son **flexibles** con selectores ya que la UI puede cambiar
- Usan `hasText()` para buscar elementos por texto (más resistente a cambios)
- Los timeouts están configurados para permitir cargas lentas
- La mayoría de tests verifican **disponibilidad** antes de interactuar

## CI/CD

Para ejecutar en CI/CD, usar:
```bash
npm run test:e2e
```

Playwright automáticamente:
- Descargará los navegadores necesarios
- Usará modo headless
- Generará reporte HTML
- Retentará fallos automáticamente (2 veces en CI)

## Reportes

Después de ejecutar tests, ver el reporte:
```bash
npx playwright show-report
```

## Browsers Soportados

- Chrome/Chromium
- Firefox
- Safari (WebKit)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
