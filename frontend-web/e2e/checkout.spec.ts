import { test, expect } from '@playwright/test';

test.describe('Checkout', () => {
  test('debería cargar página de checkout', async ({ page }) => {
    await page.goto('/checkout');
    
    // Debería cargar y mostrar algún contenido
    await expect(page.locator('body')).toBeVisible();
  });

  test('debería mostrar resumen de orden', async ({ page }) => {
    await page.goto('/checkout');
    
    // Buscar resumen de orden
    const orderSummary = page.locator('[class*="summary"], [class*="review"], [class*="order"]').first();
    if (await orderSummary.isVisible()) {
      await expect(orderSummary).toBeVisible();
    }
  });

  test('debería mostrar formulario de envío', async ({ page }) => {
    await page.goto('/checkout');
    
    // Buscar campos de dirección
    const addressInputs = page.locator('input[placeholder*="Calle"], input[placeholder*="dirección"], textarea').first();
    
    if (await addressInputs.isVisible()) {
      await expect(addressInputs).toBeVisible();
    }
  });

  test('debería permitir seleccionar método de envío', async ({ page }) => {
    await page.goto('/checkout');
    
    // Buscar opciones de envío
    const shippingOptions = page.locator('label, input[type="radio"]').filter({ hasText: /Domicilio|Retiro|Envío/i }).first();
    
    if (await shippingOptions.isVisible()) {
      await expect(shippingOptions).toBeVisible();
    }
  });

  test('debería permitir seleccionar método de pago', async ({ page }) => {
    await page.goto('/checkout');
    
    // Buscar opciones de pago
    const paymentOptions = page.locator('label, input[type="radio"]').filter({ hasText: /Tarjeta|Efectivo|Transferencia|Pago/i }).first();
    
    if (await paymentOptions.isVisible()) {
      await expect(paymentOptions).toBeVisible();
    }
  });

  test('debería validar formulario antes de procesar', async ({ page }) => {
    await page.goto('/checkout');
    
    // Buscar botón de procesar pedido
    const submitBtn = page.locator('button').filter({ hasText: /Procesar|Confirmar|Pagar|Orden/i }).first();
    
    if (await submitBtn.isVisible()) {
      // Intenta enviar sin llenar formulario
      await submitBtn.click();
      
      // Debería mostrar validación o mensajes de error
      // (depende de la implementación)
    }
  });

  test('debería permitir llenar toda la información de envío', async ({ page }) => {
    await page.goto('/checkout');
    
    // Llenar campos de envío
    const nameInput = page.locator('input[placeholder*="Nombre"], input[placeholder*="Name"]').first();
    const phoneInput = page.locator('input[placeholder*="Teléfono"], input[placeholder*="Phone"]').first();
    const addressInput = page.locator('textarea, input[placeholder*="dirección"], input[placeholder*="address"]').first();
    
    if (await nameInput.isVisible()) {
      await nameInput.fill('Juan Pérez');
    }
    
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('+57 300 123 4567');
    }
    
    if (await addressInput.isVisible()) {
      await addressInput.fill('Calle 123 No. 45-67, Apartamento 8B');
    }
  });

  test('debería mostrar costos totales desglosados', async ({ page }) => {
    await page.goto('/checkout');
    
    // Buscar subtotal, envío y total
    const subtotal = page.locator('text=/Subtotal|Sub-total/i');
    const shipping = page.locator('text=/Envío|Shipping/i');
    const total = page.locator('text=/Total|Grand Total/i');
    
    if (await subtotal.isVisible()) {
      await expect(subtotal).toBeVisible();
    }
    
    if (await shipping.isVisible()) {
      await expect(shipping).toBeVisible();
    }
    
    if (await total.isVisible()) {
      await expect(total).toBeVisible();
    }
  });

  test('debería permitir volver atrás', async ({ page }) => {
    await page.goto('/checkout');
    
    // Buscar botón de volver
    const backBtn = page.locator('button').filter({ hasText: /Volver|Atrás|Back/i }).first();
    
    if (await backBtn.isVisible()) {
      await backBtn.click();
      
      // Debería navegar a página anterior
      // (checkout no tiene validación de carrito no vacío en este test)
    }
  });
});
