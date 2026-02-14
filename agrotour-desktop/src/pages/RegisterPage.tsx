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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-stone-200 my-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-800">Crear Cuenta</h2>
          <p className="text-stone-600 mt-2">Únete a la comunidad Agrotour</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        {exito && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <p className="text-green-700 font-medium text-sm">Registro exitoso. Redirigiendo al login...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="nombreUsuario" className="block text-stone-700 font-semibold mb-1 text-sm">Usuario</label>
            <input
              id="nombreUsuario"
              type="text"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
              placeholder="Elige un nombre de usuario"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-stone-700 font-semibold mb-1 text-sm">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
              placeholder="tu@email.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="contrasena" className="block text-stone-700 font-semibold mb-1 text-sm">Contraseña</label>
              <input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="confirmarContrasena" className="block text-stone-700 font-semibold mb-1 text-sm">Confirmar</label>
              <input
                id="confirmarContrasena"
                type="password"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tipoUsuario" className="block text-stone-700 font-semibold mb-1 text-sm">Soy...</label>
            <select
              id="tipoUsuario"
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Selecciona tu perfil</option>
              <option value="cliente">Cliente (Comprador/Turista)</option>
              <option value="productor">Productor (Vendedor)</option>
            </select>
          </div>

          {tipoUsuario === 'cliente' && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-4 border border-blue-100 animate-fadeIn">
              <div>
                <label htmlFor="direccion" className="block text-stone-700 font-semibold mb-1 text-sm">Dirección</label>
                <input
                  id="direccion"
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Tu dirección de envío"
                />
              </div>
              <div>
                <label htmlFor="telefono" className="block text-stone-700 font-semibold mb-1 text-sm">Teléfono</label>
                <input
                  id="telefono"
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="+56 9..."
                />
              </div>
            </div>
          )}

          {tipoUsuario === 'productor' && (
            <div className="bg-amber-50 p-4 rounded-lg space-y-4 border border-amber-100 animate-fadeIn">
              <div>
                <label htmlFor="nombreEmpresa" className="block text-stone-700 font-semibold mb-1 text-sm">Nombre de la Empresa/Granja</label>
                <input
                  id="nombreEmpresa"
                  type="text"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="Ej: Granja El Roble"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombreTerreno" className="block text-stone-700 font-semibold mb-1 text-sm">Terreno</label>
                  <input
                    id="nombreTerreno"
                    type="text"
                    value={nombreTerreno}
                    onChange={(e) => setNombreTerreno(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    placeholder="Nombre del predio"
                  />
                </div>
                <div>
                  <label htmlFor="identificacionTerreno" className="block text-stone-700 font-semibold mb-1 text-sm">ID Terreno</label>
                  <input
                    id="identificacionTerreno"
                    type="text"
                    value={identificacionTerreno}
                    onChange={(e) => setIdentificacionTerreno(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    placeholder="Rol o ID"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="nombrePropietario" className="block text-stone-700 font-semibold mb-1 text-sm">Propietario Legal</label>
                <input
                  id="nombrePropietario"
                  type="text"
                  value={nombrePropietario}
                  onChange={(e) => setNombrePropietario(e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="Nombre completo"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-green-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Registrarse
            </button>
            <button
              type="button"
              onClick={handleVolver}
              className="px-6 py-3 border border-stone-300 text-stone-600 font-semibold rounded-lg hover:bg-stone-50 hover:text-stone-800 transition-colors"
            >
              Volver
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-stone-500">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
