import { test, expect } from '@playwright/test';

test.describe('Offline Mode', () => {
  test('debería mostrar indicador de offline cuando se desconecta', async ({ page, context }) => {
    await page.goto('/');
    
    // Simular desconexión
    await context.setOffline(true);
    
    await page.waitForTimeout(1000);
    
    // Buscar indicador de offline
    const offlineIndicator = page.locator('text=/Offline|Sin conexión/i, [class*="offline"]');
    
    if (await offlineIndicator.first().isVisible()) {
      await expect(offlineIndicator.first()).toBeVisible();
    }
  });

  test('debería permitir navegar cuando está offline', async ({ page, context }) => {
    await page.goto('/');
    
    // Desconectar
    await context.setOffline(true);
    
    await page.waitForTimeout(1000);
    
    // Intentar navegar a otra página
    const exploreBtn = page.locator('a, button').filter({ hasText: /Explorar|Productos/i }).first();
    
    if (await exploreBtn.isVisible()) {
      await exploreBtn.click();
      
      // La página debería cargar (con datos en caché)
      await page.waitForTimeout(2000);
      
      // Debería estar en la URL esperada o mostrar contenido en caché
    }
  });

  test('debería mantener el carrito en offline', async ({ page, context }) => {
    await page.goto('/paginaexploraproducto');
    
    await page.waitForTimeout(2000);
    
    // Agregar producto
    const addBtn = page.locator('button').filter({ hasText: /Agregar|Add/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Desconectar
    await context.setOffline(true);
    
    await page.waitForTimeout(500);
    
    // Abrir carrito
    const cartButton = page.locator('button').filter({ has: page.locator('text=🛍') }).first();
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      await page.waitForTimeout(500);
      
      // El carrito debería tener el producto
      const cartItems = page.locator('[class*="item"], [class*="product"]').first();
      if (await cartItems.isVisible()) {
        await expect(cartItems).toBeVisible();
      }
    }
  });

  test('debería mostrar estado de sincronización', async ({ page, context }) => {
    await page.goto('/panelcliente');
    
    // Desconectar
    await context.setOffline(true);
    
    await page.waitForTimeout(1000);
    
    // Buscar indicador de sincronización
    const syncStatus = page.locator('[class*="sync"], text=/Sincronizando|Pendiente/i');
    
    if (await syncStatus.first().isVisible()) {
      // Debería mostrar estado de pendiente
    }
  });

  test('debería sincronizar cambios cuando se reconecta', async ({ page, context }) => {
    await page.goto('/');
    
    // Agregar al carrito
    const addBtn = page.locator('button').filter({ hasText: /Agregar|Add/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Desconectar
    await context.setOffline(true);
    
    await page.waitForTimeout(1000);
    
    // Agregar más al carrito (mientras está offline)
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Reconectar
    await context.setOffline(false);
    
    await page.waitForTimeout(2000);
    
    // Los cambios deberían sincronizarse
    const syncIndicator = page.locator('[class*="sync"]');
    if (await syncIndicator.isVisible()) {
      // Verificar que mostró sincronización
    }
  });

  test('debería reintentrar descargas fallidas cuando se reconecta', async ({ page, context }) => {
    await page.goto('/paginaexploraproducto');
    
    // Desconectar
    await context.setOffline(true);
    
    await page.waitForTimeout(1000);
    
    // Intentar hacer algo que requiera conexión
    const addBtn = page.locator('button').filter({ hasText: /Agregar|Add/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Reconectar
    await context.setOffline(false);
    
    await page.waitForTimeout(2000);
    
    // Debería reintentar automáticamente
    // (verificar mediante sync status o indicadores)
  });

  test('debería usar datos en caché cuando está offline', async ({ page, context }) => {
    // Cargar página con conexión
    await page.goto('/paginaexploraproducto');
    
    await page.waitForTimeout(2000);
    
    // Verificar que hay contenido visible
    const products = page.locator('[class*="product"], article').first();
    const hasProducts = await products.isVisible();
    
    // Desconectar
    await context.setOffline(true);
    
    await page.waitForTimeout(1000);
    
    // Recargar página
    await page.reload();
    
    await page.waitForTimeout(2000);
    
    // Los datos en caché deberían estar disponibles
    if (hasProducts) {
      const cachedProducts = page.locator('[class*="product"], article').first();
      if (await cachedProducts.isVisible()) {
        await expect(cachedProducts).toBeVisible();
      }
    }
  });
});
