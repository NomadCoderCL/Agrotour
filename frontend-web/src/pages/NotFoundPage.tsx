/**
 * NotFoundPage - Página 404 con estilo premium
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, MapPin } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="text-center max-w-lg">
        {/* Big 404 */}
        <div className="text-[120px] md:text-[160px] font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 select-none">
          404
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2 mb-4">
          ¡Ups! Esta ruta no existe
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Parece que te perdiste en la Patagonia. La página que buscas no se encontró,
          pero podemos ayudarte a volver al camino.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            Ir al Inicio
          </Link>
          <Link
            to="/productos"
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-full transition-all border border-gray-200 dark:border-gray-600"
          >
            <MapPin className="w-4 h-4" />
            Explorar Productos
          </Link>
        </div>

        {/* Back link */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium flex items-center justify-center mx-auto gap-1 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver atrás
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
