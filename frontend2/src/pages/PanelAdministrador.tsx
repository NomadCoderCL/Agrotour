import React, { useState } from 'react';

const clientes = [
  { id: 1, nombre: 'Juan Pérez', tipo: 'cliente' },
  { id: 2, nombre: 'María Rodríguez', tipo: 'productor' },
  { id: 3, nombre: 'Pedro Gómez', tipo: 'cliente' },
  { id: 4, nombre: 'Ana García', tipo: 'productor' },
  { id: 5, nombre: 'Carlos López', tipo: 'cliente' },
];

const AdminPanel = () => {
  const [filtro, setFiltro] = useState('todos');
  const [clientesFiltrados, setClientesFiltrados] = useState(clientes);
  const [opcion, setOpcion] = useState('listado');
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const handleFiltroChange = (filtro: string) => {
    setFiltro(filtro);
    if (filtro === 'todos') {
      setClientesFiltrados(clientes);
    } else {
      setClientesFiltrados(clientes.filter((cliente) => cliente.tipo === filtro));
    }
  };

  const handleOpcionChange = (opcion: string) => {
    setOpcion(opcion);
    setMostrarMenu(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 bg-green-100 flex">
      <div className="w-1/5 bg-sky-200 p-4">
        <button
          className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setMostrarMenu(!mostrarMenu)}
        >
          Menú
        </button>
        {mostrarMenu && (
          <ul className="mt-4">
            <li className="py-2">
              <button
                className={`text-brown-500 hover:text-brown-700 font-bold py-2 px-4 rounded ${opcion === 'listado' ? 'bg-sky-400' : ''}`}
                onClick={() => handleOpcionChange('listado')}
              >
                Listado de usuarios
              </button>
            </li>
            <li className="py-2">
              <button
                className={`text-brown-500 hover:text-brown-700 font-bold py-2 px-4 rounded ${opcion === 'ajustes' ? 'bg-sky-400' : ''}`}
                onClick={() => handleOpcionChange('ajustes')}
              >
                Ajustes
              </button>
            </li>
            <li className="py-2">
              <button
                className={`text-brown-500 hover:text-brown-700 font-bold py-2 px-4 rounded ${opcion === 'informes' ? 'bg-sky-400' : ''}`}
                onClick={() => handleOpcionChange('informes')}
              >
                Generar informes
              </button>
            </li>
            <li className="py-2">
              <button
                className={`text-brown-500 hover:text-brown-700 font-bold py-2 px-4 rounded ${opcion === 'cuentas' ? 'bg-sky-400' : ''}`}
                onClick={() => handleOpcionChange('cuentas')}
              >
                Administración de cuentas
              </button>
            </li>
          </ul>
        )}
      </div>
      <div className="w-4/5 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-brown-500">Panel de Administrador</h1>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => console.log('Cerrar sesión')}
          >
            Cerrar sesión
          </button>
        </div>
        {opcion === 'listado' && (
          <div className="flex flex-wrap justify-center mb-4">
            <button
              className={`text-brown-500 hover:text-brown-700 font-bold py-2 px-4 rounded ${filtro === 'todos' ? 'bg-sky-200' : ''}`}
              onClick={() => handleFiltroChange('todos')}
            >
              Todos
            </button>
            <button
              className={`text-brown-500 hover:text-brown-700 font-bold py-2 px-4 rounded ${filtro === 'cliente' ? 'bg-sky-200' : ''}`}
              onClick={() => handleFiltroChange('cliente')}
            >
              Clientes
            </button>
            <button
              className={`text-brown-500 hover:text-brown-700 font-bold py-2 px-4 rounded ${filtro === 'productor' ? 'bg-sky-200' : ''}`}
              onClick={() => handleFiltroChange('productor')}
            >
              Productores
            </button>
            <table className="w-full bg-green-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-brown-500">ID</th>
                  <th className="px-4 py-2 text-brown-500">Nombre</th>
                  <th className="px-4 py-2 text-brown-500">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="px-4 py-2 text-brown-500">{cliente.id}</td>
                    <td className="px-4 py-2 text-brown-500">{cliente.nombre}</td>
                    <td className="px-4 py-2 text-brown-500">{cliente.tipo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {opcion === 'ajustes' && (
          <div className="flex flex-wrap justify-center mb-4">
            <h2 className="text-2xl font-bold text-brown-500">Ajustes</h2>
          </div>
        )}
        {opcion === 'informes' && (
          <div className="flex flex-wrap justify-center mb-4">
            <h2 className="text-2xl font-bold text-brown-500">Generar informes</h2>
          </div>
        )}
        {opcion === 'cuentas' && (
          <div className="flex flex-wrap justify-center mb-4">
            <h2 className="text-2xl font-bold text-brown-500">Administración de cuentas</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;