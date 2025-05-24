import React, { useState } from 'react';
import { API_URL, fetchWithAuth, handleApiError } from '../lib/utils';

const Registro: React.FC = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombreTerreno, setNombreTerreno] = useState('');
  const [nombrePropietario, setNombrePropietario] = useState('');
  const [identificacionTerreno, setIdentificacionTerreno] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setExito(false);

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!tipoUsuario) {
      setError('Debe seleccionar un tipo de usuario.');
      return;
    }

    const datos = {
      username: nombreUsuario,
      email,
      password: contrasena,
      rol: tipoUsuario,
      direccion: tipoUsuario === 'cliente' ? direccion : null,
      telefono: tipoUsuario === 'cliente' ? telefono : null,
      nombre_terreno: tipoUsuario === 'productor' ? nombreTerreno : null,
      nombre_propietario: tipoUsuario === 'productor' ? nombrePropietario : null,
      identificacion_terreno: tipoUsuario === 'productor' ? identificacionTerreno : null,
      nombre_empresa: tipoUsuario === 'productor' ? nombreEmpresa : null,
    };

    try {
      const response = await fetchWithAuth(`${API_URL}/auth/registro/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      if (response.ok) {
        setExito(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al registrar el usuario.');
      }
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  const handleVolver = () => {
    window.history.back();
  };

  return (
    <div className="flex justify-center items-center h-screen bg-sky-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-600">Registro</h2>
        {error && <div className="text-red-600 mb-4 font-semibold">{error}</div>}
        {exito && <div className="text-green-600 mb-4 font-semibold">Registro exitoso. Redirigiendo al login...</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nombreUsuario" className="block text-sm font-bold mb-2 text-green-700">Nombre de Usuario</label>
            <input
              id="nombreUsuario"
              type="text"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
              placeholder="Ingrese su nombre de usuario"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-bold mb-2 text-green-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
              placeholder="Ingrese su correo electrónico"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="contrasena" className="block text-sm font-bold mb-2 text-green-700">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
              placeholder="Ingrese su contraseña"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmarContrasena" className="block text-sm font-bold mb-2 text-green-700">Confirmar Contraseña</label>
            <input
              id="confirmarContrasena"
              type="password"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
              placeholder="Confirme su contraseña"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="tipoUsuario" className="block text-sm font-bold mb-2 text-green-700">Tipo de Usuario</label>
            <select
              id="tipoUsuario"
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
            >
              <option value="">Seleccione un tipo de usuario</option>
              <option value="cliente">Cliente</option>
              <option value="productor">Productor</option>
            </select>
          </div>
          {tipoUsuario === 'cliente' && (
            <>
              <div className="mb-4">
                <label htmlFor="direccion" className="block text-sm font-bold mb-2 text-green-700">Dirección</label>
                <input
                  id="direccion"
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                  placeholder="Ingrese su dirección"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="telefono" className="block text-sm font-bold mb-2 text-green-700">Teléfono</label>
                <input
                  id="telefono"
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                  placeholder="Ingrese su teléfono"
                />
              </div>
            </>
          )}
          {tipoUsuario === 'productor' && (
            <>
              <div className="mb-4">
                <label htmlFor="nombreTerreno" className="block text-sm font-bold mb-2 text-green-700">Nombre del Terreno</label>
                <input
                  id="nombreTerreno"
                  type="text"
                  value={nombreTerreno}
                  onChange={(e) => setNombreTerreno(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                  placeholder="Ingrese el nombre del terreno"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="nombrePropietario" className="block text-sm font-bold mb-2 text-green-700">Nombre del Propietario</label>
                <input
                  id="nombrePropietario"
                  type="text"
                  value={nombrePropietario}
                  onChange={(e) => setNombrePropietario(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                  placeholder="Ingrese el nombre del propietario"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="identificacionTerreno" className="block text-sm font-bold mb-2 text-green-700">Identificación del Terreno</label>
                <input
                  id="identificacionTerreno"
                  type="text"
                  value={identificacionTerreno}
                  onChange={(e) => setIdentificacionTerreno(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                  placeholder="Ingrese la identificación del terreno"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="nombreEmpresa" className="block text-sm font-bold mb-2 text-green-700">Nombre de la Empresa</label>
                <input
                  id="nombreEmpresa"
                  type="text"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                  placeholder="Ingrese el nombre de la empresa"
                />
              </div>
            </>
          )}
          <div className="flex justify-between mt-6">
            <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none">
              Registrar
            </button>
            <button type="button" onClick={handleVolver} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none">
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;
