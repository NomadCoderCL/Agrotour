/**
 * SeguimientoPedidos.tsx - Tracking visual de pedidos
 * Diseño: Vertical Timeline
 * Estados: Confirmado -> Preparando -> Recolectado -> En Camino -> Entregado
 */

import React, { useState } from 'react';
import { CheckCircle2, Package, Truck, Home, MapPin } from 'lucide-react';

const SeguimientoPedidos: React.FC = () => {
  // Estado Mock para demo
  const [activeStep, setActiveStep] = useState(2); // 0-based index: 0=Confirmado, 1=Preparando, 2=Recolectado...

  const steps = [
    {
      title: 'Pedido Confirmado',
      description: 'Tu orden #12345 ha sido recibida exitosamente.',
      date: '10 Feb, 14:30',
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Productor Preparando',
      description: 'Granja El Roble está armando tu caja de productos frescos.',
      date: '10 Feb, 16:45',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Recolectado por Transporte',
      description: 'El camión rural ha recogido tus productos.',
      date: '11 Feb, 09:15',
      icon: Truck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
    },
    {
      title: 'En Camino a tu Dirección',
      description: 'Tu pedido está en ruta hacia Villa Los Torreones.',
      date: 'Estimado: Hoy 18:00',
      icon: MapPin,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Entregado',
      description: '¡Disfruta tus productos del campo!',
      date: '---',
      icon: Home,
      color: 'text-gray-400',
      bg: 'bg-gray-100',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">📦 Seguimiento de Pedido</h1>
      <p className="text-gray-500 mb-8">Pedido #12345 • Estimada llegada: Hoy 18:00</p>

      <div className="relative pl-8 border-l-2 border-gray-200 space-y-10 ml-4">
        {steps.map((step, index) => {
          const isActive = index <= activeStep;
          const isCurrent = index === activeStep;
          const Icon = step.icon;

          return (
            <div key={index} className="relative">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-[41px] top-0 w-8 h-8 rounded-full border-4 flex items-center justify-center bg-white transition-all duration-500 ${isActive ? `border-green-500 ${step.color}` : 'border-gray-200 text-gray-300'
                  }`}
              >
                {isActive && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
              </div>

              {/* Content Card */}
              <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-2'}`}>
                <div className="flex items-start justify-between mb-1">
                  <h3 className={`font-bold text-lg ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.title}
                  </h3>
                  <span className={`text-xs font-semibold ${isActive ? 'text-gray-500' : 'text-gray-300'}`}>
                    {step.date}
                  </span>
                </div>

                <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-300'}`}>
                  {step.description}
                </p>

                {isCurrent && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                    Estado Actual
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Demo Controls */}
      <div className="mt-12 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Demo Controls</p>
        <div className="flex justify-center gap-2">
          <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100">Anterior</button>
          <button onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100">Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoPedidos;
