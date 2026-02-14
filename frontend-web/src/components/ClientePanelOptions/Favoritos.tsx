/**
 * Favoritos.tsx - Productos favoritos del cliente
 * Permite agilizar la recompra guardando productos frecuentes.
 * Diseño Mobile-First: Grid de productos.
 */

import React, { useState } from 'react';
import { ShoppingCart, Heart, ExternalLink } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

// Datos Mock para Favoritos
const MOCK_FAVORITOS = [
    {
        id: 1,
        nombre: 'Papas Orgánicas',
        precio: 1500,
        imagen: '', // Placeholder
        productor: 'Granja El Roble',
        categoria: 'Hortalizas',
        stock: 120,
    },
    {
        id: 3,
        nombre: 'Mermelada de Calafate',
        precio: 4500,
        imagen: '',
        productor: 'Sabores del Sur',
        categoria: 'Procesados',
        stock: 30,
    },
    {
        id: 5,
        nombre: 'Queso de Oveja',
        precio: 12000,
        imagen: '',
        productor: 'Lácteos Aysén',
        categoria: 'Lácteos',
        stock: 8,
    },
];

const Favoritos: React.FC = () => {
    const [favoritos, setFavoritos] = useState(MOCK_FAVORITOS);
    const { agregarAlCarro } = useCart();

    const handleAddToCart = (producto: any) => {
        agregarAlCarro({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            // imagen: producto.imagen, // CartContext doesn't support image yet
            cantidad: 1, // Default quantity
        });
        // Feedback visual simple (podría ser un toast)
        // alert(`${producto.nombre} agregado al carro`);
    };

    const removeFavorito = (id: number) => {
        setFavoritos(prev => prev.filter(p => p.id !== id));
    };

    if (favoritos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <Heart className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-600">No tienes favoritos aún</h3>
                <p className="text-gray-500 mt-2">Marca productos con el corazón para verlos aquí.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
                <Heart className="fill-red-500 text-red-500" /> Mis Favoritos
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {favoritos.map((prod) => (
                    <div key={prod.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        {/* Imagen Placeholder con Gradiente */}
                        <div className="h-32 bg-gradient-to-br from-green-100 to-blue-50 flex items-center justify-center relative">
                            <span className="text-4xl">📦</span>
                            <button
                                onClick={() => removeFavorito(prod.id)}
                                className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-red-500 hover:bg-white transition-colors"
                                title="Quitar de favoritos"
                            >
                                <Heart className="w-4 h-4 fill-current" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="mb-2">
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    {prod.categoria}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-800 truncate">{prod.nombre}</h3>
                            <p className="text-sm text-gray-500 mb-3">{prod.productor}</p>

                            <div className="flex items-center justify-between mt-4">
                                <span className="text-lg font-bold text-green-700">
                                    ${prod.precio.toLocaleString('es-CL')}
                                </span>

                                <button
                                    onClick={() => handleAddToCart(prod)}
                                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Favoritos;
