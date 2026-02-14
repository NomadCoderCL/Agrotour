import React, { useState } from 'react';
import { API_URL, fetchWithAuth, handleApiError } from '../lib/utils';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetchWithAuth(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username, // Cambiar a 'email' si el backend requiere correo electrónico
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Credenciales inválidas o error del servidor.');
      }

      const data = await response.json();

      // Guardar tokens y rol en localStorage
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_role', data.user.rol);

      // Redirigir según el rol del usuario
      switch (data.user.rol) {
        case 'productor':
          window.location.href = '/panel-productor';
          break;
        case 'cliente':
          window.location.href = '/panel-cliente';
          break;
        case 'admin':
          window.location.href = '/panel-admin';
          break;
        default:
          window.location.href = '/';
      }
    } catch (err: any) {
      handleApiError(err, setError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolver = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border border-stone-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Bienvenido de nuevo</h1>
          <p className="text-stone-600 mt-2">Ingresa a tu cuenta Agrotour</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-stone-700 font-semibold mb-2">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              placeholder="Tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-stone-700 font-semibold mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-stone-50"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-800 active:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando...
              </span>
            ) : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 text-center space-y-4">
          <p className="text-sm text-stone-500">
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors">
              Regístrate aquí
            </a>
          </p>

          <button
            onClick={handleVolver}
            className="text-sm text-stone-500 hover:text-stone-700 font-medium flex items-center justify-center mx-auto gap-1 transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
