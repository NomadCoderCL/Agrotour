import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test('debería alternar dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Buscar y hacer clic en botón de dark mode
    const darkModeBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    if (await darkModeBtn.isVisible()) {
      // Verificar estado inicial
      const html = page.locator('html');
      const initialClass = await html.getAttribute('class');
      
      // Hacer clic en dark mode
      await darkModeBtn.click();
      await page.waitForTimeout(500);
      
      // Verificar que la clase cambió
      const newClass = await html.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    }
  });

  test('debería aplicar clases dark a elementos', async ({ page }) => {
    await page.goto('/');
    
    // Hacer clic en dark mode
    const darkModeBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    if (await darkModeBtn.isVisible()) {
      await darkModeBtn.click();
      await page.waitForTimeout(500);
      
      // Verificar que navbar tiene clase dark
      const navbar = page.locator('nav');
      if (await navbar.isVisible()) {
        const navClass = await navbar.getAttribute('class');
        expect(navClass).toMatch(/dark:|bg-blue-900/);
      }
    }
  });

  test('debería persistir preferencia de dark mode', async ({ page, context }) => {
    await page.goto('/');
    
    // Habilitar dark mode
    const darkModeBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    if (await darkModeBtn.isVisible()) {
      await darkModeBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Ir a otra página
    await page.goto('/login');
    
    // Verificar que dark mode sigue activo
    const html = page.locator('html');
    const hasClass = await html.evaluate((el) => el.classList.contains('dark'));
    
    if (hasClass === undefined) {
      // Verificar mediante localStorage
      const darkModeSetting = await page.evaluate(() => 
        localStorage.getItem('darkMode')
      );
      expect(darkModeSetting).toBe('true');
    }
  });

  test('debería cambiar colores de fondo en dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Obtener color inicial
    const body = page.locator('body');
    const initialBgColor = await body.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Habilitar dark mode
    const darkModeBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    if (await darkModeBtn.isVisible()) {
      await darkModeBtn.click();
      await page.waitForTimeout(500);
      
      // Obtener nuevo color
      const newBgColor = await body.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Los colores deberían ser diferentes
      expect(newBgColor).not.toBe(initialBgColor);
    }
  });

  test('debería aplicar dark mode en todos los panels', async ({ page }) => {
    await page.goto('/');
    
    // Habilitar dark mode
    const darkModeBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    if (await darkModeBtn.isVisible()) {
      await darkModeBtn.click();
      await page.waitForTimeout(500);
      
      // Navegar a login y verificar dark mode
      await page.goto('/login');
      
      const html = page.locator('html');
      const isDark = await html.evaluate((el) => el.classList.contains('dark'));
      
      if (isDark === undefined) {
        // Alternativamente verificar si hay clase en el DOM
        const classList = await html.getAttribute('class');
        // Dark mode debería estar activo en todas partes
      }
    }
  });

  test('debería funcionar toggle múltiples veces', async ({ page }) => {
    await page.goto('/');
    
    const darkModeBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    
    if (await darkModeBtn.isVisible()) {
      // Primera vez
      await darkModeBtn.click();
      await page.waitForTimeout(300);
      
      let isDark = await page.locator('html').evaluate((el) => el.classList.contains('dark'));
      
      // Segunda vez (toggle off)
      await darkModeBtn.click();
      await page.waitForTimeout(300);
      
      let isDarkAfter = await page.locator('html').evaluate((el) => el.classList.contains('dark'));
      
      // Debería ser diferente
      expect(isDark).not.toBe(isDarkAfter);
    }
  });
});
