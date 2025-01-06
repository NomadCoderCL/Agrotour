// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Página No Encontrada</h1>
      <p className="text-gray-600 mb-6">Lo sentimos, la página que buscas no existe.</p>
      <Link to="/" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
