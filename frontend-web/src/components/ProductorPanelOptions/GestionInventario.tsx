/**
 * GestionInventario - Gestión de productos del productor
 * Mobile-first design: Card grid (mobile) + Table (desktop)
 * CRUD con react-hook-form + estado local (preparado para useQuery/fetch)
 * Categorías sincronizadas con el Catálogo Público
 */

import React, { useState, useCallback, useEffect } from 'react';
import { API_URL, fetchWithAuth } from '../../lib/utils';
import { useForm } from 'react-hook-form';
import {
  Plus, X, Edit3, Pause, Play, Trash2, Search,
  Package, Tag, DollarSign, Image, Save, ChevronDown
} from 'lucide-react';

// ─── Categorías (sincronizadas con PaginaExplorarProductos) ───────────
const CATEGORIAS = [
  { id: 'hortalizas', label: 'Hortalizas', icon: '🥬' },
  { id: 'frutas', label: 'Frutas', icon: '🍎' },
  { id: 'lacteos', label: 'Lácteos', icon: '🧀' },
  { id: 'carnes', label: 'Carnes', icon: '🥩' },
  { id: 'miel', label: 'Miel y Dulces', icon: '🍯' },
  { id: 'artesania', label: 'Artesanía', icon: '🧶' },
  { id: 'turismo', label: 'Experiencias', icon: '🚜' },
  { id: 'procesados', label: 'Procesados', icon: '🫙' },
] as const;

const MODOS_VENTA = [
  { id: 'unidad', label: 'Por Unidad' },
  { id: 'kilo', label: 'Por Kilo' },
  { id: 'litro', label: 'Por Litro' },
  { id: 'bandeja', label: 'Por Bandeja' },
  { id: 'experiencia', label: 'Por Persona (Experiencia)' },
] as const;

// ─── Tipos ────────────────────────────────────────────────────────────
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  modoVenta: string;
  imagen: string;
  activo: boolean;
  fechaCreacion: string;
}

interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  modoVenta: string;
  imagen: string;
}

// ─── Datos de prueba ──────────────────────────────────────────────────
const DEMO_PRODUCTOS: Producto[] = [
  {
    id: 1, nombre: 'Papas Orgánicas', descripcion: 'Papas cultivadas sin pesticidas, cosecha reciente',
    precio: 1500, stock: 120, categoria: 'hortalizas', modoVenta: 'kilo', imagen: '', activo: true,
    fechaCreacion: '2026-01-15',
  },
  {
    id: 2, nombre: 'Lechugas Hidropónicas', descripcion: 'Mix de lechugas frescas en bandeja de 250g',
    precio: 2500, stock: 45, categoria: 'hortalizas', modoVenta: 'bandeja', imagen: '', activo: true,
    fechaCreacion: '2026-01-20',
  },
  {
    id: 3, nombre: 'Mermelada de Calafate', descripcion: 'Mermelada artesanal de calafate silvestre, frasco 500ml',
    precio: 4500, stock: 30, categoria: 'procesados', modoVenta: 'unidad', imagen: '', activo: true,
    fechaCreacion: '2026-02-01',
  },
  {
    id: 4, nombre: 'Miel de Ulmo', descripcion: 'Miel pura cosecha 2026, 1 litro',
    precio: 8500, stock: 15, categoria: 'miel', modoVenta: 'litro', imagen: '', activo: false,
    fechaCreacion: '2026-02-05',
  },
  {
    id: 5, nombre: 'Queso de Oveja Curado', descripcion: 'Madurado 6 meses, rueda de 500g',
    precio: 12000, stock: 8, categoria: 'lacteos', modoVenta: 'unidad', imagen: '', activo: true,
    fechaCreacion: '2026-02-08',
  },
  {
    id: 6, nombre: 'Visita Guiada al Campo', descripcion: 'Recorrido de 3 horas con degustación incluida',
    precio: 35000, stock: 10, categoria: 'turismo', modoVenta: 'experiencia', imagen: '', activo: true,
    fechaCreacion: '2026-02-10',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────
const formatPrecio = (precio: number) =>
  precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const getCategoriaInfo = (id: string) =>
  CATEGORIAS.find((c) => c.id === id) || { id, label: id, icon: '📦' };

// ─── Componente Principal ─────────────────────────────────────────────
const GestionInventario: React.FC = () => {
  // ─── Estado ──────────────────────────────────────────────────────────
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);

  // ─── React Hook Form ────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormData>({
    defaultValues: {
      nombre: '', descripcion: '', precio: 0, stock: 0,
      categoria: '', modoVenta: 'unidad', imagen: '',
    },
  });

  // ─── API Fetch ───────────────────────────────────────────────────
  const fetchProductos = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) return;

      const response = await fetchWithAuth(`${API_URL}/api/productos/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        const mapped = data.map((p: any) => ({
          ...p,
          precio: Number(p.precio), // Ensure number
          stock: Number(p.stock),
          modoVenta: p.metodo_venta || 'unidad', // Map API field
          fechaCreacion: p.created_at || new Date().toISOString()
        }));
        setProductos(mapped);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // ─── Filtrado ────────────────────────────────────────────────────
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(buscar.toLowerCase())
  );

  // ─── CRUD ────────────────────────────────────────────────────────
  const onSubmit = async (data: ProductoFormData) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return;

    // Map form data to API format
    const payload = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: Number(data.precio),
      stock: Number(data.stock),
      categoria: data.categoria || null, // API expects ID or null
      productor: 1, // API should infer from token, but might need explicit ID if backend requires it. Usually backend handles "me".
      metodo_venta: data.modoVenta,
      imagen: data.imagen,
      activo: true
    };

    try {
      let response;
      if (editando) {
        // Update
        response = await fetchWithAuth(`${API_URL}/api/productos/${editando.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        response = await fetchWithAuth(`${API_URL}/api/productos/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        await fetchProductos(); // Refresh list
        cerrarModal();
      } else {
        alert('Error al guardar el producto');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error de conexión');
    }
  };

  const toggleEstado = async (id: number) => {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const accessToken = localStorage.getItem('access_token');
    try {
      const response = await fetchWithAuth(`${API_URL}/api/productos/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ activo: !producto.activo }),
      });

      if (response.ok) {
        setProductos(prev => prev.map(p => p.id === id ? { ...p, activo: !p.activo } : p));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const eliminarProducto = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto permanentemente?')) return;

    const accessToken = localStorage.getItem('access_token');
    try {
      const response = await fetchWithAuth(`${API_URL}/api/productos/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (response.ok) {
        setProductos(prev => prev.filter(p => p.id !== id));
      } else {
        alert('No se pudo eliminar el producto');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // ─── Modal helpers ──────────────────────────────────────────────
  const abrirCrear = () => {
    setEditando(null);
    reset({ nombre: '', descripcion: '', precio: 0, stock: 0, categoria: '', modoVenta: 'unidad', imagen: '' });
    setModalOpen(true);
  };

  const abrirEditar = (producto: Producto) => {
    setEditando(producto);
    reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria,
      modoVenta: producto.modoVenta,
      imagen: producto.imagen,
    });
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
    reset();
  };

  // ─── Estadísticas rápidas ───────────────────────────────────────
  const stats = {
    total: productos.length,
    activos: productos.filter((p) => p.activo).length,
    pausados: productos.filter((p) => !p.activo).length,
    stockBajo: productos.filter((p) => p.stock <= 5 && p.activo).length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            📦 Mi Inventario
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona tus productos y controla tu stock
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* ─── Stats Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Activos', value: stats.activos, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Pausados', value: stats.pausados, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Stock bajo', value: stats.stockBajo, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Search ────────────────────────────────────────────── */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar en mi inventario..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-400 focus:outline-none"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
           MOBILE VIEW: Card Grid (visible < md)
         ═══════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3">
        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No hay productos.</p>
          </div>
        )}
        {productosFiltrados.map((producto) => {
          const cat = getCategoriaInfo(producto.categoria);
          return (
            <div
              key={producto.id}
              onClick={() => abrirEditar(producto)}
              className={`bg-white dark:bg-gray-800 rounded-xl border ${producto.activo
                ? 'border-gray-200 dark:border-gray-700'
                : 'border-yellow-300 dark:border-yellow-700 opacity-75'
                } p-4 shadow-sm active:shadow-md transition-all cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                {/* Imagen placeholder */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 flex items-center justify-center flex-shrink-0 text-2xl">
                  {cat.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{producto.nombre}</h3>
                    <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${producto.activo
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                      {producto.activo ? 'Activo' : 'Pausado'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{cat.label} · {producto.modoVenta}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold text-green-700 dark:text-green-400">{formatPrecio(producto.precio)}</span>
                    <span className={`text-xs font-medium ${producto.stock <= 5 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                      Stock: {producto.stock}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleEstado(producto.id); }}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${producto.activo
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                    }`}
                >
                  {producto.activo ? <><Pause className="w-3.5 h-3.5" /> Pausar</> : <><Play className="w-3.5 h-3.5" /> Activar</>}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); abrirEditar(producto); }}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); eliminarProducto(producto.id); }}
                  className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
           DESKTOP VIEW: Table (visible >= md)
         ═══════════════════════════════════════════════════════════ */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producto</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {productosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No hay productos
                </td>
              </tr>
            )}
            {productosFiltrados.map((producto) => {
              const cat = getCategoriaInfo(producto.categoria);
              return (
                <tr
                  key={producto.id}
                  onClick={() => abrirEditar(producto)}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${!producto.activo ? 'opacity-60' : ''
                    }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 flex items-center justify-center text-lg flex-shrink-0">
                        {cat.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{producto.nombre}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">{producto.descripcion}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {cat.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-green-700 dark:text-green-400 text-sm">
                    {formatPrecio(producto.precio)}
                  </td>
                  <td className={`px-5 py-4 text-right text-sm font-medium ${producto.stock <= 5 ? 'text-red-500 font-bold' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {producto.stock}
                    {producto.stock <= 5 && <span className="ml-1 text-[10px]">⚠️</span>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${producto.activo
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                      {producto.activo ? 'Activo' : 'Pausado'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleEstado(producto.id); }}
                        title={producto.activo ? 'Pausar' : 'Activar'}
                        className={`p-2 rounded-lg transition-all ${producto.activo
                          ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                      >
                        {producto.activo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirEditar(producto); }}
                        title="Editar"
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); eliminarProducto(producto.id); }}
                        title="Eliminar"
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           MODAL: Crear/Editar Producto (react-hook-form)
         ═══════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editando ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
              </h2>
              <button onClick={cerrarModal} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Nombre */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Package className="w-4 h-4" /> Nombre del producto *
                </label>
                <input
                  {...register('nombre', {
                    required: 'El nombre es obligatorio',
                    minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                  })}
                  placeholder="Ej: Papas Orgánicas"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.nombre ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200 dark:border-gray-700'
                    } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all`}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Descripción
                </label>
                <textarea
                  {...register('descripcion')}
                  rows={2}
                  placeholder="Describe tu producto..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Precio + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    <DollarSign className="w-4 h-4" /> Precio (CLP) *
                  </label>
                  <input
                    type="number"
                    {...register('precio', {
                      required: 'El precio es obligatorio',
                      min: { value: 1, message: 'Debe ser mayor a $0' },
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.precio ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200 dark:border-gray-700'
                      } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all`}
                  />
                  {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Stock *
                  </label>
                  <input
                    type="number"
                    {...register('stock', {
                      required: 'El stock es obligatorio',
                      min: { value: 0, message: 'No puede ser negativo' },
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.stock ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200 dark:border-gray-700'
                      } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all`}
                  />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                </div>
              </div>

              {/* Categoría + Modo de Venta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    <Tag className="w-4 h-4" /> Categoría *
                  </label>
                  <div className="relative">
                    <select
                      {...register('categoria', { required: 'Selecciona una categoría' })}
                      className={`w-full appearance-none px-4 py-3 rounded-xl border ${errors.categoria ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200 dark:border-gray-700'
                        } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all`}
                    >
                      <option value="">Seleccionar...</option>
                      {CATEGORIAS.map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Modo de Venta *
                  </label>
                  <div className="relative">
                    <select
                      {...register('modoVenta', { required: 'Selecciona un modo' })}
                      className={`w-full appearance-none px-4 py-3 rounded-xl border ${errors.modoVenta ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200 dark:border-gray-700'
                        } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all`}
                    >
                      {MODOS_VENTA.map((m) => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.modoVenta && <p className="text-red-500 text-xs mt-1">{errors.modoVenta.message}</p>}
                </div>
              </div>

              {/* Imagen URL (placeholder) */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Image className="w-4 h-4" /> URL de Imagen (opcional)
                </label>
                <input
                  {...register('imagen')}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {editando ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Floating Action Button (Mobile Only) ──────────────── */}
      <button
        onClick={abrirCrear}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-xl flex items-center justify-center z-40 active:scale-95 transition-all"
        aria-label="Nuevo producto"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};

export default GestionInventario;
