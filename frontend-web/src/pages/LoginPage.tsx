/**
 * LoginPage - Página de inicio de sesión
 * Usa AuthContext para login unificado
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, LogIn, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si venimos de PrivateRoute, obtener la ruta original
  const from = (location.state as any)?.from?.pathname || null;

  const getRolRedirect = (rol: string) => {
    const map: Record<string, string> = {
      cliente: '/panel/cliente',
      productor: '/panel/productor',
      admin: '/panel/admin',
      superuser: '/panel/superuser',
    };
    return map[rol] || '/';
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      await login(username, password);

      // Redirigir: si viene de una ruta protegida, volver allí.
      // Si no, ir al panel según rol
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Obtener rol del usuario desde el token o contexto
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            navigate(getRolRedirect(payload.rol || 'cliente'), { replace: true });
          } catch {
            navigate('/panel/cliente', { replace: true });
          }
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Error de conexión. Verifica tu internet o que el servidor esté activo.');
      } else if (err.response?.status === 401 || err.response?.status === 400) {
        // dj-rest-auth suele devolver errores en non_field_errors
        const data = err.response.data;
        if (data?.non_field_errors && Array.isArray(data.non_field_errors)) {
          setError(data.non_field_errors[0]);
        } else {
          setError('Credenciales incorrectas. Verifica tu usuario y contraseña.');
        }
      } else if (err.response?.status >= 500) {
        setError('Error interno del servidor. Inténtalo más tarde.');
      } else {
        setError(err?.message || 'Ocurrió un error inesperado al iniciar sesión.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-stone-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌱</div>
          <h1 className="text-3xl font-bold text-green-800">Bienvenido de nuevo</h1>
          <p className="text-stone-600 mt-2">Ingresa a tu cuenta Agrotour</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-stone-700 font-semibold mb-2 text-sm">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              placeholder="Tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-stone-700 font-semibold mb-2 text-sm">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-green-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-800 active:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Iniciando...
              </span>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center space-y-4">
          <p className="text-sm text-stone-500">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors">
              Regístrate aquí
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

export default LoginPage;
