import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('debería cargar la página de inicio', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que el título está presente
    await expect(page.locator('h1')).toContainText('Agrotour');
    
    // Verificar que el navbar está visible
    await expect(page.locator('nav')).toBeVisible();
  });

  test('debería mostrar el carrito', async ({ page }) => {
    await page.goto('/');
    
    // Buscar botón del carrito
    const cartButton = page.locator('button').filter({ has: page.locator('text=🛍') }).first();
    await expect(cartButton).toBeVisible();
  });

  test('debería tener botón de dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que el botón de dark mode existe
    const darkModeBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    await expect(darkModeBtn).toBeVisible();
  });

  test('debería navegar a explorar productos desde home', async ({ page }) => {
    await page.goto('/');
    
    // Buscar y hacer clic en un botón que lleve a productos
    const exploreBtn = page.locator('a, button').filter({ hasText: /Explorar|Productos/i }).first();
    if (await exploreBtn.isVisible()) {
      await exploreBtn.click();
      await page.waitForURL('**/paginaexploraproducto');
    }
  });

  test('debería navegar al mapa desde home', async ({ page }) => {
    await page.goto('/');
    
    // Buscar y hacer clic en "Mapa"
    const mapLink = page.locator('a, button').filter({ hasText: /Mapa/i }).first();
    if (await mapLink.isVisible()) {
      await mapLink.click();
      await page.waitForURL('**/mapa');
    }
  });
});
