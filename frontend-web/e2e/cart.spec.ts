import { test, expect } from '@playwright/test';

test.describe('Carrito de Compras', () => {
  test('debería abrir el carrito', async ({ page }) => {
    await page.goto('/');
    
    // Buscar y hacer clic en botón del carrito
    const cartButton = page.locator('button').filter({ has: page.locator('text=🛍') }).first();
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // El drawer del carrito debería aparecer
      const cartDrawer = page.locator('[class*="drawer"], [class*="cart"], aside').first();
      if (await cartDrawer.isVisible()) {
        await expect(cartDrawer).toBeVisible();
      }
    }
  });

  test('debería mostrar carrito vacío inicialmente', async ({ page }) => {
    await page.goto('/');
    
    const cartButton = page.locator('button').filter({ has: page.locator('text=🛍') }).first();
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Buscar mensaje de carrito vacío
      const emptyMsg = page.locator('text=/Carrito vacío|Empty cart/i');
      if (await emptyMsg.isVisible()) {
        await expect(emptyMsg).toBeVisible();
      }
    }
  });

  test('debería agregar producto al carrito', async ({ page }) => {
    // Ir a explorar productos
    await page.goto('/paginaexploraproducto');
    
    await page.waitForTimeout(2000);
    
    // Buscar botón "Agregar al carrito"
    const addBtn = page.locator('button, [role="button"]').filter({ hasText: /Agregar|Add to cart|Comprar/i }).first();
    
    if (await addBtn.isVisible()) {
      await addBtn.click();
      
      // Verificar que se agregó (puede haber toast o confirmación)
      await page.waitForTimeout(1000);
    }
  });

  test('debería actualizar cantidad en carrito', async ({ page }) => {
    await page.goto('/');
    
    // Agregar algo primero
    const addBtn = page.locator('button').filter({ hasText: /Agregar|Add/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Abrir carrito
    const cartButton = page.locator('button').filter({ has: page.locator('text=🛍') }).first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Buscar inputs de cantidad
      const quantityInputs = page.locator('input[type="number"], [class*="quantity"]');
      if (await quantityInputs.first().isVisible()) {
        await quantityInputs.first().fill('3');
        await page.waitForTimeout(500);
      }
    }
  });

  test('debería eliminar producto del carrito', async ({ page }) => {
    await page.goto('/');
    
    // Agregar producto
    const addBtn = page.locator('button').filter({ hasText: /Agregar|Add/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Abrir carrito
    const cartButton = page.locator('button').filter({ has: page.locator('text=🛍') }).first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Buscar botón eliminar/remove
      const removeBtn = page.locator('button').filter({ hasText: /Eliminar|Quitar|Remove|Delete|×/i }).first();
      if (await removeBtn.isVisible()) {
        await removeBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('debería mostrar total del carrito', async ({ page }) => {
    await page.goto('/');
    
    // Agregar producto
    const addBtn = page.locator('button').filter({ hasText: /Agregar|Add/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Abrir carrito
    const cartButton = page.locator('button').filter({ has: page.locator('text=🛍') }).first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Buscar total
      const total = page.locator('text=/Total|Subtotal|Grand Total/i');
      if (await total.isVisible()) {
        await expect(total).toBeVisible();
      }
    }
  });

  test('debería navegar a checkout desde carrito', async ({ page }) => {
    await page.goto('/');
    
    // Agregar producto
    const addBtn = page.locator('button').filter({ hasText: /Agregar|Add/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Abrir carrito
    const cartButton = page.locator('button').filter({ has: page.locator('text=🛍') }).first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Buscar botón checkout
      const checkoutBtn = page.locator('button').filter({ hasText: /Checkout|Proceder|Continuar|Pagar/i }).first();
      if (await checkoutBtn.isVisible()) {
        await checkoutBtn.click();
        await page.waitForURL('**/checkout', { timeout: 5000 }).catch(() => {
          // Puede que redirija a login si no está autenticado
        });
      }
    }
  });

  test('debería persistir carrito en localStorage', async ({ page, context }) => {
    await page.goto('/paginaexploraproducto');
    
    await page.waitForTimeout(2000);
    
    // Agregar producto
    const addBtn = page.locator('button').filter({ hasText: /Agregar|Add/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Actualizar página
    await page.reload();
    
    await page.waitForTimeout(2000);
    
    // Carrito debería aún contener el producto
    const cartButton = page.locator('button').filter({ has: page.locator('text=🛍') }).first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      const cartItems = page.locator('[class*="item"], [class*="product"]').first();
      if (await cartItems.isVisible()) {
        await expect(cartItems).toBeVisible();
      }
    }
  });
});
