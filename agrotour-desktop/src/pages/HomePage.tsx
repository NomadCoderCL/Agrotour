import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
// Prueba de importación del Shared Kernel
import { SHARED_SCHEMA_VERSION } from '@shared/types/version';

const HomePage: React.FC = () => {
  console.log(`Agrotour Core Version: ${SHARED_SCHEMA_VERSION}`); // Verificación en consola

  return (
    <div className="flex flex-col min-h-screen bg-agro-cream">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-agro-green-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-0" />
        {/* Placeholder de imagen, reemplazar con /img/hero.jpg real cuando exista */}
        <div className="absolute inset-0 bg-gradient-to-br from-agro-green-dark to-agro-blue-dark opacity-90 z-0" />

        <div className="relative z-10 text-center px-4 max-w-4xl animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full bg-agro-green-light/20 border border-agro-green-light text-agro-green-light text-sm font-bold mb-6 backdrop-blur-sm">
            🚀 Turismo Rural Inteligente v{SHARED_SCHEMA_VERSION}
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-lg">
            Del campo a tu mesa,<br />de tu casa al campo.
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Conecta directamente con productores de Aysén. Sin intermediarios, con trazabilidad real y tecnología offline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/mapa" className="flex items-center justify-center gap-2 bg-agro-green hover:bg-agro-green-light text-white font-bold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              <MapPin className="w-5 h-5" />
              Explorar Mapa
            </Link>
            <Link to="/login" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border-2 border-white text-white font-bold py-4 px-8 rounded-full transition-all backdrop-blur-sm">
              Ingresar / Registrarse
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios Rápidos */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full grid md:grid-cols-3 gap-8 -mt-20 relative z-20">
        {[
          { icon: ShoppingBag, title: "Mercado Rural", text: "Productos frescos y artesanía local.", color: "text-agro-green" },
          { icon: MapPin, title: "Rutas Turísticas", text: "Experiencias únicas en la Patagonia.", color: "text-agro-blue" },
          { icon: ArrowRight, title: "Logística Justa", text: "Envíos coordinados y económicos.", color: "text-agro-brown" },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-b-4 border-agro-green-dark/10 group cursor-default">
            <item.icon className={`w-12 h-12 ${item.color} mb-4 group-hover:scale-110 transition-transform`} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
