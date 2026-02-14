/**
 * ProductoFilter - Componente de filtros y búsqueda para explorar productos
 */

import React from 'react';

interface Props {
  categories?: string[];
  onChange: (payload: { query?: string; category?: string }) => void;
}

export const ProductoFilter: React.FC<Props> = ({ categories = [], onChange }) => {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('');

  React.useEffect(() => {
    const t = setTimeout(() => onChange({ query: query.trim() || undefined, category: category || undefined }), 300);
    return () => clearTimeout(t);
  }, [query, category, onChange]);

  return (
    <div className="mb-4 flex flex-col md:flex-row gap-3 items-center">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos..."
        className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <button
        onClick={() => {
          setQuery('');
          setCategory('');
        }}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
      >
        Limpiar
      </button>
    </div>
  );
};

export default ProductoFilter;
