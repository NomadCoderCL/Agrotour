/**
 * RegisterPage - Página de registro de usuarios
 * Usa AuthContext para registro + auto-login
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState('');

  // Campos extra según rol
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombreTerreno, setNombreTerreno] = useState('');
  const [nombrePropietario, setNombrePropietario] = useState('');
  const [identificacionTerreno, setIdentificacionTerreno] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const getRolRedirect = (rol: string) => {
    const map: Record<string, string> = {
      cliente: '/panel/cliente',
      productor: '/panel/productor',
    };
    return map[rol] || '/';
  };

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

    if (!nombreUsuario.trim() || !email.trim() || !contrasena.trim()) {
      setError('Todos los campos obligatorios deben estar completos.');
      return;
    }

    try {
      await register(nombreUsuario, email, contrasena, tipoUsuario);
      setExito(true);
      // Auto-login happens inside register(), redirect after brief delay
      setTimeout(() => {
        navigate(getRolRedirect(tipoUsuario), { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Error al registrar el usuario.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-stone-200 my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌱</div>
          <h2 className="text-3xl font-bold text-green-800">Crear Cuenta</h2>
          <p className="text-stone-600 mt-2">Únete a la comunidad Agrotour</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {exito && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <p className="text-green-700 font-medium text-sm">
              ✅ Registro exitoso. Redirigiendo a tu panel...
            </p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="nombreUsuario" className="block text-stone-700 font-semibold mb-1 text-sm">Usuario</label>
            <input
              id="nombreUsuario"
              type="text"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
              placeholder="Elige un nombre de usuario"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-stone-700 font-semibold mb-1 text-sm">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="contrasena" className="block text-stone-700 font-semibold mb-1 text-sm">Contraseña</label>
              <div className="relative">
                <input
                  id="contrasena"
                  type={showPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmarContrasena" className="block text-stone-700 font-semibold mb-1 text-sm">Confirmar</label>
              <input
                id="confirmarContrasena"
                type={showPassword ? 'text' : 'password'}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="tipoUsuario" className="block text-stone-700 font-semibold mb-1 text-sm">Soy...</label>
            <select
              id="tipoUsuario"
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Selecciona tu perfil</option>
              <option value="cliente">🛒 Cliente (Comprador/Turista)</option>
              <option value="productor">🌾 Productor (Vendedor)</option>
            </select>
          </div>

          {/* Campos extra para Cliente */}
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

          {/* Campos extra para Productor */}
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

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || exito}
              className="w-full flex items-center justify-center gap-2 bg-green-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registrando...
                </span>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Registrarse
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-stone-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
          <Link
            to="/"
            className="text-sm text-stone-500 hover:text-stone-700 font-medium flex items-center justify-center mx-auto gap-1 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
