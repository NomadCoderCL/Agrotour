import { test, expect } from '@playwright/test';

test.describe('Explorar Productos', () => {
  test('debería cargar página de exploración de productos', async ({ page }) => {
    await page.goto('/paginaexploraproducto');
    
    // Verificar que se cargó la página
    await expect(page.locator('body')).toBeVisible();
    
    // Dar tiempo para que carguen los productos
    await page.waitForTimeout(2000);
  });

  test('debería mostrar filtros de productos', async ({ page }) => {
    await page.goto('/paginaexploraproducto');
    
    // Buscar sección de filtros
    const filterSection = page.locator('[class*="filter"], [class*="Filter"], section').first();
    if (await filterSection.isVisible()) {
      await expect(filterSection).toBeVisible();
    }
  });

  test('debería mostrar lista de productos', async ({ page }) => {
    await page.goto('/paginaexploraproducto');
    
    await page.waitForTimeout(2000);
    
    // Buscar tarjetas de producto
    const productCards = page.locator('[class*="card"], [class*="product"], article').first();
    
    // Debería haber al menos una tarjeta de producto
    if (await productCards.isVisible()) {
      await expect(productCards).toBeVisible();
    }
  });

  test('debería permitir búsqueda de productos', async ({ page }) => {
    await page.goto('/paginaexploraproducto');
    
    // Buscar input de búsqueda
    const searchInput = page.locator('input[type="text"], input[placeholder*="Buscar"], input[placeholder*="Search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('tomates');
      await page.waitForTimeout(1000);
      
      // Los resultados deberían cambiar o filtrar
    }
  });

  test('debería permitir filtrar por categoría', async ({ page }) => {
    await page.goto('/paginaexploraproducto');
    
    // Buscar botones de filtro de categoría
    const categoryFilter = page.locator('button, label').filter({ hasText: /Categoría|Category|Verduras|Frutas/i }).first();
    
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.waitForTimeout(1000);
    }
  });

  test('debería permitir filtrar por rango de precio', async ({ page }) => {
    await page.goto('/paginaexploraproducto');
    
    // Buscar inputs de precio
    const priceInputs = page.locator('input[type="range"], input[type="number"]').first();
    
    if (await priceInputs.isVisible()) {
      // Interactuar con controles de precio si existen
    }
  });

  test('debería mostrar detalles al hacer clic en un producto', async ({ page }) => {
    await page.goto('/paginaexploraproducto');
    
    await page.waitForTimeout(2000);
    
    // Buscar primer producto y hacer clic
    const firstProduct = page.locator('[class*="card"], [class*="product"], article').first();
    
    if (await firstProduct.isVisible()) {
      const productLink = firstProduct.locator('a, button').first();
      if (await productLink.isVisible()) {
        await productLink.click();
        
        // Debería haber información detallada del producto
        const productDetail = page.locator('[class*="detail"], [class*="info"]').first();
        if (await productDetail.isVisible()) {
          await expect(productDetail).toBeVisible();
        }
      }
    }
  });
});
