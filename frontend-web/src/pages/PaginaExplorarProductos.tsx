/**
 * PaginaExplorarProductos - Catálogo inteligente con filtros
 * MASTER FILE §2: Filtros por categoría, precio, ubicación + búsqueda fuzzy
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ShoppingCart, MapPin, Tag, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  ubicacion: string;
  productor: string;
  stock: number;
}

// Categorías predefinidas para Aysén
const CATEGORIAS = [
  { id: 'todas', label: 'Todas', icon: '🏷️' },
  { id: 'hortalizas', label: 'Hortalizas', icon: '🥬' },
  { id: 'frutas', label: 'Frutas', icon: '🍎' },
  { id: 'lacteos', label: 'Lácteos', icon: '🧀' },
  { id: 'carnes', label: 'Carnes', icon: '🥩' },
  { id: 'miel', label: 'Miel y Dulces', icon: '🍯' },
  { id: 'artesania', label: 'Artesanía', icon: '🧶' },
  { id: 'turismo', label: 'Experiencias', icon: '🚜' },
];

const RANGOS_PRECIO = [
  { id: 'todos', label: 'Todos los precios' },
  { id: '0-5000', label: '$0 - $5.000' },
  { id: '5000-15000', label: '$5.000 - $15.000' },
  { id: '15000-50000', label: '$15.000 - $50.000' },
  { id: '50000+', label: '$50.000+' },
];

// Demo products (serán reemplazados por datos del backend)
const DEMO_PRODUCTOS: Producto[] = [
  { id: 1, nombre: 'Mermelada de Calafate', descripcion: 'Mermelada artesanal de calafate silvestre de la Patagonia', precio: 4500, imagen: '', categoria: 'miel', ubicacion: 'Coyhaique', productor: 'Granja El Roble', stock: 15 },
  { id: 2, nombre: 'Queso de Oveja Curado', descripcion: 'Queso artesanal madurado 6 meses, leche de oveja', precio: 12000, imagen: '', categoria: 'lacteos', ubicacion: 'Chile Chico', productor: 'Lácteos Del Sur', stock: 8 },
  { id: 3, nombre: 'Miel de Ulmo', descripcion: 'Miel pura de ulmo, cosecha primaveral', precio: 8500, imagen: '', categoria: 'miel', ubicacion: 'La Junta', productor: 'Apiario Aysén', stock: 22 },
  { id: 4, nombre: 'Cordero Patagónico (kg)', descripcion: 'Cordero criado a campo abierto, alimentación natural', precio: 15000, imagen: '', categoria: 'carnes', ubicacion: 'Balmaceda', productor: 'Estancia Los Ñires', stock: 5 },
  { id: 5, nombre: 'Tejido Mapuche', descripcion: 'Bufanda tejida a mano con lana natural teñida', precio: 25000, imagen: '', categoria: 'artesania', ubicacion: 'Coyhaique', productor: 'Artesanías Ñuke', stock: 3 },
  { id: 6, nombre: 'Visita Guiada a Granja', descripcion: 'Recorrido de 3 horas por una granja orgánica con degustación', precio: 35000, imagen: '', categoria: 'turismo', ubicacion: 'Puerto Aysén', productor: 'Agroturismo Río Baker', stock: 10 },
  { id: 7, nombre: 'Lechugas Orgánicas (bandeja)', descripcion: 'Mix de lechugas hidropónicas sin pesticidas', precio: 2500, imagen: '', categoria: 'hortalizas', ubicacion: 'Coyhaique', productor: 'Huerto Verde', stock: 30 },
  { id: 8, nombre: 'Manzanas Fuji (kg)', descripcion: 'Manzanas frescas de huerto familiar', precio: 1800, imagen: '', categoria: 'frutas', ubicacion: 'Chile Chico', productor: 'Frutales del Lago', stock: 50 },
];

const Catalogo: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [buscar, setBuscar] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [rangoPrecio, setRangoPrecio] = useState('todos');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [productos] = useState<Producto[]>(DEMO_PRODUCTOS);
  const [ordenar, setOrdenar] = useState<'relevancia' | 'precio-asc' | 'precio-desc' | 'nombre'>('relevancia');

  // Filtrado y búsqueda
  const productosFiltrados = useMemo(() => {
    let result = [...productos];

    // Filtro por categoría
    if (categoriaActiva !== 'todas') {
      result = result.filter((p) => p.categoria === categoriaActiva);
    }

    // Filtro por precio
    if (rangoPrecio !== 'todos') {
      const [min, max] = rangoPrecio.split('-').map(Number);
      if (rangoPrecio.endsWith('+')) {
        result = result.filter((p) => p.precio >= parseInt(rangoPrecio));
      } else {
        result = result.filter((p) => p.precio >= min && p.precio <= max);
      }
    }

    // Búsqueda fuzzy (case-insensitive en nombre, descripción, productor, ubicación)
    if (buscar.trim()) {
      const query = buscar.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query) ||
          p.descripcion.toLowerCase().includes(query) ||
          p.productor.toLowerCase().includes(query) ||
          p.ubicacion.toLowerCase().includes(query)
      );
    }

    // Ordenar
    switch (ordenar) {
      case 'precio-asc':
        result.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        result.sort((a, b) => b.precio - a.precio);
        break;
      case 'nombre':
        result.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
    }

    return result;
  }, [productos, categoriaActiva, rangoPrecio, buscar, ordenar]);

  const formatPrecio = (precio: number) =>
    precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Productos Locales</h1>
          <p className="text-green-100 text-lg mb-6">Descubre lo mejor de la Patagonia, directo del productor</p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar productos, productores, ubicaciones..."
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-0 shadow-lg focus:ring-2 focus:ring-green-400 focus:outline-none text-base"
            />
            {buscar && (
              <button onClick={() => setBuscar('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${categoriaActiva === cat.id
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{productosFiltrados.length}</span>{' '}
            {productosFiltrados.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </p>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value as typeof ordenar)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none cursor-pointer"
              >
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${filtersOpen
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-300'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {filtersOpen && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rango de Precio</h4>
              <div className="flex flex-wrap gap-2">
                {RANGOS_PRECIO.map((rango) => (
                  <button
                    key={rango.id}
                    onClick={() => setRangoPrecio(rango.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${rangoPrecio === rango.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {rango.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => { setCategoriaActiva('todas'); setRangoPrecio('todos'); setBuscar(''); }}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {productosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 overflow-hidden group"
              >
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 flex items-center justify-center relative overflow-hidden">
                  <span className="text-5xl">
                    {CATEGORIAS.find((c) => c.id === producto.categoria)?.icon || '🛒'}
                  </span>
                  {producto.stock <= 5 && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ¡Últimas {producto.stock}!
                    </span>
                  )}
                </div>

                <div className="p-5">
                  {/* Category badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {CATEGORIAS.find((c) => c.id === producto.categoria)?.label || producto.categoria}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                    {producto.nombre}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {producto.descripcion}
                  </p>

                  {/* Location & Producer */}
                  <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mb-4">
                    <MapPin className="w-3 h-3" />
                    {producto.ubicacion} · {producto.productor}
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-green-700 dark:text-green-400">
                      {formatPrecio(producto.precio)}
                    </span>
                    <button
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all hover:shadow-md"
                      title={isAuthenticated ? 'Agregar al carrito' : 'Inicia sesión para comprar'}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isAuthenticated ? 'Agregar' : 'Ver'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Sin resultados</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No se encontraron productos con los filtros seleccionados.
            </p>
            <button
              onClick={() => { setCategoriaActiva('todas'); setRangoPrecio('todos'); setBuscar(''); }}
              className="text-green-600 dark:text-green-400 font-medium hover:underline"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}

        {/* Guest notice */}
        {!isAuthenticated && productosFiltrados.length > 0 && (
          <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-center">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              💡 <strong>Inicia sesión</strong> para agregar productos al carrito y realizar compras.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;
