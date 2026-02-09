/**
 * E2E Tests - Detox Configuration
 * Test suite for critical flows: auth, products, cart, checkout
 */

describe('Agrotour App - E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Authentication Flow', () => {
    it('should display login screen', async () => {
      await expect(element(by.text('Login'))).toBeVisible();
    });

    it('should login with valid credentials', async () => {
      await element(by.id('username-input')).typeText('testuser');
      await element(by.id('password-input')).typeText('password123');
      await element(by.text('Sign In')).multiTap();

      await waitFor(element(by.text('Home')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show error on invalid credentials', async () => {
      await element(by.id('username-input')).typeText('invalid');
      await element(by.id('password-input')).typeText('invalid');
      await element(by.text('Sign In')).multiTap();

      await waitFor(element(by.text('Invalid credentials')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Product Browsing', () => {
    beforeAll(async () => {
      // Login first
      await element(by.id('username-input')).typeText('testuser');
      await element(by.id('password-input')).typeText('password123');
      await element(by.text('Sign In')).multiTap();
      await waitFor(element(by.text('Home'))).toBeVisible().withTimeout(5000);
    });

    it('should display home screen with featured products', async () => {
      await expect(element(by.text('Featured Products'))).toBeVisible();
      await expect(element(by.id('product-card-0'))).toBeVisible();
    });

    it('should navigate to all products', async () => {
      await element(by.id('tab-productos')).tap();
      await waitFor(element(by.text('Productos')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should filter products by search', async () => {
      await element(by.id('search-input')).typeText('tomate');
      await waitFor(element(by.id('product-card-tomate')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Shopping Cart', () => {
    it('should add product to cart', async () => {
      await element(by.id('product-card-0')).multiTap();
      await element(by.text('Agregar al Carrito')).tap();

      await waitFor(element(by.text('1'))) // Cart count badge
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display cart drawer', async () => {
      await element(by.id('cart-button')).tap();
      await waitFor(element(by.text('Carrito')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should update product quantity', async () => {
      await element(by.id('quantity-input-0')).clearText();
      await element(by.id('quantity-input-0')).typeText('3');

      await waitFor(element(by.text('3')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should remove product from cart', async () => {
      await element(by.text('Eliminar')).atIndex(0).tap();

      await waitFor(element(by.text('Tu carrito está vacío')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Checkout Flow', () => {
    beforeEach(async () => {
      // Add items to cart
      await element(by.id('product-card-0')).multiTap();
      await element(by.text('Agregar al Carrito')).tap();
      await element(by.id('cart-button')).tap();
    });

    it('should display checkout page', async () => {
      await element(by.text('Checkout')).tap();
      await waitFor(element(by.text('Finalizar Compra')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should validate shipping form', async () => {
      await element(by.text('Finalizar Compra')).tap();

      // Should show validation error
      await waitFor(element(by.text('Completa todos los campos')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should complete purchase', async () => {
      // Fill shipping form
      await element(by.id('fullname-input')).typeText('John Doe');
      await element(by.id('phone-input')).typeText('+56912345678');
      await element(by.id('address-input')).typeText('Av Principal 123');
      await element(by.id('city-input')).typeText('Santiago');
      await element(by.id('zip-input')).typeText('8320000');

      // Submit
      await element(by.text('Confirmar Compra')).tap();

      // Should show success
      await waitFor(element(by.text('¡Compra Exitosa!')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Map & Producers', () => {
    it('should display map page', async () => {
      await element(by.id('tab-mapa')).tap();
      await waitFor(element(by.text('Mapa de Productores')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display producer markers on map', async () => {
      await waitFor(element(by.type('RCTMapView')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('User Profile', () => {
    it('should display profile page', async () => {
      await element(by.id('tab-perfil')).tap();
      await waitFor(element(by.text('Mi Perfil')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should logout', async () => {
      await element(by.text('Cerrar Sesión')).tap();

      await waitFor(element(by.text('Login')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Offline Mode', () => {
    it('should show offline indicator when disconnected', async () => {
      await device.setAirplaneMode(true);

      await waitFor(element(by.text('Modo Offline')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should restore online indicator when reconnected', async () => {
      await device.setAirplaneMode(false);

      await waitFor(element(by.text('Modo Offline')))
        .not.toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Dark Mode', () => {
    it('should toggle dark mode', async () => {
      await element(by.id('dark-mode-toggle')).tap();

      // Verify dark mode is active (check background color or theme)
      await expect(element(by.id('app-container'))).toHaveToggleValue(true);
    });
  });

  describe('Latency & Stress Testing (Phase 2A)', () => {
    it('should handle 2000ms network latency without UI freeze', async () => {
      // Login
      await element(by.id('username-input')).typeText('testuser');
      await element(by.id('password-input')).typeText('password123');
      await element(by.text('Sign In')).multiTap();
      await waitFor(element(by.text('Home'))).toBeVisible().withTimeout(5000);

      // Simulate slow network (2000ms delay)
      // Note: Detox doesn't natively support network throttling,
      // so backend must be configured for testing with delays

      // Navigate to productos tab
      await element(by.id('tab-productos')).tap();

      // Verify loading spinner appears within 500ms
      await waitFor(element(by.id('loading-spinner')))
        .toBeVisible()
        .withTimeout(500);

      // Wait for products to load (2000ms + buffer)
      await waitFor(element(by.text('Producto')))
        .toBeVisible()
        .withTimeout(8000);

      // Verify UI remains responsive - buttons should be tappable
      await element(by.id('filter-button')).tap();
      await expect(element(by.id('filter-modal'))).toBeVisible();
    });

    it('should recover from network timeout (30s+)', async () => {
      // Navigate to products
      await element(by.id('tab-productos')).tap();

      // Show loading spinner
      await waitFor(element(by.id('loading-spinner')))
        .toBeVisible()
        .withTimeout(500);

      // After 30s timeout, retry button should appear
      // In production, backend would not respond, causing timeout
      await waitFor(element(by.id('retry-button')))
        .toBeVisible()
        .withTimeout(35000);

      // Tap retry button
      await element(by.id('retry-button')).tap();

      // Should attempt to load again
      await waitFor(element(by.id('loading-spinner')))
        .toBeVisible()
        .withTimeout(1000);
    });

    it('should handle API contract mismatch gracefully (400 error)', async () => {
      // This test simulates a response from backend that doesn't match expected schema
      // The app should show an error toast \"Update Required\" but NOT crash

      // Try to add product to cart with mismatched response
      await element(by.id('add-to-cart-button').and(by.text('Producto 1'))).tap();

      // If contract mismatch (400), should see error toast
      await waitFor(element(by.text(/Update Required|error/i)))
        .toBeVisible()
        .withTimeout(5000);

      // App should still be responsive (not frozen/crashed)
      await element(by.id('tab-home')).tap();
      await expect(element(by.text('Home'))).toBeVisible();
    });

    it('should handle server error gracefully (500 error)', async () => {
      // Simulate server error response
      await element(by.id('tab-productos')).tap();

      // Wait for loading
      await waitFor(element(by.id('loading-spinner')))
        .toBeVisible()
        .withTimeout(1000);

      // When server returns 500, should see error message
      await waitFor(element(by.text(/Error en el servidor|Server Error/i)))
        .toBeVisible()
        .withTimeout(10000);

      // Verify retry button is shown
      await expect(element(by.id('retry-button'))).toBeVisible();

      // App should be responsive
      await element(by.id('tab-carrito')).tap();
      await expect(element(by.text('Carrito'))).toBeVisible();
    });

    it('should persist cart data during slow sync (offline queue)', async () => {
      // Navigate to productos
      await element(by.id('tab-productos')).tap();
      await waitFor(element(by.text('Producto'))).toBeVisible().withTimeout(5000);

      // Add multiple products to cart quickly
      await element(by.id('add-to-cart-button').and(by.text('Producto 1'))).tap();
      await element(by.id('add-to-cart-button').and(by.text('Producto 2'))).tap();
      await element(by.id('add-to-cart-button').and(by.text('Producto 3'))).tap();

      // Navigate to cart
      await element(by.id('tab-carrito')).tap();

      // Cart should show all 3 items (even if sync is pending)
      await expect(element(by.text('Producto 1'))).toBeVisible();
      await expect(element(by.text('Producto 2'))).toBeVisible();
      await expect(element(by.text('Producto 3'))).toBeVisible();

      // Cart data should persist after screen reload
      await device.reloadReactNative();
      await waitFor(element(by.text('Producto 1'))).toBeVisible().withTimeout(5000);
    });

    it('should handle rapid screen navigation without crashes', async () => {
      // Rapid tab switching under slow network
      for (let i = 0; i < 5; i++) {
        await element(by.id('tab-home')).tap();
        await element(by.id('tab-productos')).tap();
        await element(by.id('tab-mapa')).tap();
        await element(by.id('tab-carrito')).tap();
        await element(by.id('tab-panel')).tap();
      }

      // App should still be responsive and not crashed
      await element(by.id('tab-home')).tap();
      await expect(element(by.text('Home'))).toBeVisible();
    });
  });
});
