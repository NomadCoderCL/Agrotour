/**
 * HomePage - Landing page principal
 * Propuesta de valor, servicios rápidos, testimonios y CTA
 * Ref: MASTER FILE sección 2 (Zona Pública)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShoppingBag, ArrowRight, Truck, Star, Users, Leaf, Shield } from 'lucide-react';
import { SHARED_SCHEMA_VERSION } from '@shared/types/version';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-emerald-900 z-0" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fsvg%3E')] z-0" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-green-200 text-sm font-bold mb-6 backdrop-blur-sm">
            🚀 Turismo Rural Inteligente v{SHARED_SCHEMA_VERSION}
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-lg">
            Del campo a tu mesa,<br />de tu casa al campo.
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Conecta directamente con productores de Aysén. Sin intermediarios, con trazabilidad real y tecnología offline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/productos"
              className="flex items-center justify-center gap-2 bg-white text-green-800 font-bold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-green-50"
            >
              <ShoppingBag className="w-5 h-5" />
              Ver Productos
            </Link>
            <Link
              to="/mapa"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border-2 border-white/40 text-white font-bold py-4 px-8 rounded-full transition-all backdrop-blur-sm"
            >
              <MapPin className="w-5 h-5" />
              Explorar Mapa
            </Link>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" className="fill-white dark:fill-gray-900" />
          </svg>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-white dark:bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '50+', label: 'Productores', icon: Users },
            { value: '200+', label: 'Productos', icon: ShoppingBag },
            { value: '100%', label: 'Trazable', icon: Shield },
            { value: '24/7', label: 'Offline-First', icon: Leaf },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center">
              <Icon className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios Rápidos */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tres pasos para conectar con lo mejor de la Patagonia
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: 'Mercado Rural',
                text: 'Explora productos frescos, artesanía y experiencias directamente de productores locales.',
                color: 'text-green-600',
                bg: 'bg-green-100 dark:bg-green-900/30',
                link: '/productos',
              },
              {
                icon: MapPin,
                title: 'Rutas Turísticas',
                text: 'Descubre dónde están los campos, planifica visitas guiadas y conoce a los productores.',
                color: 'text-blue-600',
                bg: 'bg-blue-100 dark:bg-blue-900/30',
                link: '/mapa',
              },
              {
                icon: Truck,
                title: 'Logística Justa',
                text: 'Envíos coordinados, tracking de pedidos y entrega directa del campo a tu hogar.',
                color: 'text-amber-600',
                bg: 'bg-amber-100 dark:bg-amber-900/30',
                link: '/register',
              },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.link}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group cursor-pointer hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.text}</p>
                <span className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${item.color} group-hover:gap-2 transition-all`}>
                  Explorar <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Historias reales de productores y clientes de Aysén
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'María Contreras',
                role: 'Productora en Coyhaique',
                text: 'Gracias a Agrotour pude vender mis mermeladas artesanales a clientes de toda la región. ¡Los pedidos llegan automáticamente!',
                stars: 5,
              },
              {
                name: 'Carlos Sepúlveda',
                role: 'Turista de Santiago',
                text: 'Descubrí una granja increíble en el mapa, reservé una visita guiada y fue la mejor experiencia de mis vacaciones.',
                stars: 5,
              },
              {
                name: 'Ana Ruiz',
                role: 'Productora en Chile Chico',
                text: 'La herramienta de inventario me permite gestionar mi stock incluso cuando no tengo internet. Es perfecto para la zona rural.',
                stars: 5,
              },
            ].map((t) => (
              <div key={t.name} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-700 to-emerald-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            ¿Listo para conectar con lo rural?
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-xl mx-auto">
            Únete como cliente o productor y sé parte del comercio justo de la Patagonia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 bg-white text-green-800 font-bold py-4 px-8 rounded-full hover:bg-green-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Crear Cuenta Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 bg-white/10 border-2 border-white/30 text-white font-bold py-4 px-8 rounded-full hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
