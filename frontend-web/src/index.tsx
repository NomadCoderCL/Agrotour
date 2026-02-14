import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css'; // Importa los estilos globales
import App from './App'; // Componente principal

// Verifica si existe el elemento raíz
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("No se encontró un elemento con id 'root' en el DOM.");
}

// Inicializa React Root
const root = ReactDOM.createRoot(rootElement);

root.render(
  <App />
);
