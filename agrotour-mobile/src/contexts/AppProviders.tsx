import React from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { DarkModeProvider } from './DarkModeContext';
import { ProductProvider } from './ProductContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
};
