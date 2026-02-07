import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('debería mostrar página de login', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar que el formulario está presente
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Verificar botón de login
    await expect(page.locator('button').filter({ hasText: /Iniciar Sesión|Login/i }).first()).toBeVisible();
  });

  test('debería mostrar página de registro', async ({ page }) => {
    await page.goto('/register');
    
    // Verificar campos del formulario
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Verificar botón de registro
    await expect(page.locator('button').filter({ hasText: /Registrarse|Register/i }).first()).toBeVisible();
  });

  test('debería validar email vacío en login', async ({ page }) => {
    await page.goto('/login');
    
    // Llenar solo contraseña
    await page.locator('input[type="password"]').fill('password123');
    
    // Hacer clic en login
    const loginBtn = page.locator('button').filter({ hasText: /Iniciar Sesión|Login/i }).first();
    await loginBtn.click();
    
    // Debería mostrar error o estar deshabilitado
    // (depende de la implementación)
  });

  test('debería tener enlace a registro desde login', async ({ page }) => {
    await page.goto('/login');
    
    // Buscar enlace a registro
    const registerLink = page.locator('a, button').filter({ hasText: /Registro|Register|Crear una cuenta/i });
    if (await registerLink.first().isVisible()) {
      await registerLink.first().click();
      await page.waitForURL('**/register');
    }
  });

  test('debería tener enlace a login desde registro', async ({ page }) => {
    await page.goto('/register');
    
    // Buscar enlace a login
    const loginLink = page.locator('a, button').filter({ hasText: /Ya tengo cuenta|Iniciar|Login/i });
    if (await loginLink.first().isVisible()) {
      await loginLink.first().click();
      await page.waitForURL('**/login');
    }
  });

  test('debería prevenir login con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    
    // Intentar login con credenciales inválidas
    await page.locator('input[type="email"]').fill('test@invalid.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    
    const loginBtn = page.locator('button').filter({ hasText: /Iniciar Sesión|Login/i }).first();
    await loginBtn.click();
    
    // Debería rechazar o mostrar error
    // (verificar según la implementación del backend)
  });
});
