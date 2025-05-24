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
          window.location.href = '/panelproductor';
          break;
        case 'cliente':
          window.location.href = '/panelcliente';
          break;
        case 'admin':
          window.location.href = '/adminpanel';
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
    window.history.back();
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-green-300 via-[#AFEEEE] to-[#D2B48C] p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-800">Iniciar Sesión</h2>
        {error && <div className="text-red-600 mb-4 font-semibold">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">
              Usuario (Username)
            </label>
            <input
              type="text"
              id="username"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">¿Olvidaste tu contraseña?</p>
          <button
            className="text-blue-600 font-bold hover:underline"
            onClick={() => console.log('Recuperar contraseña')}
          >
            Recuperar Contraseña
          </button>
        </div>
        <div className="flex justify-between mt-6 space-x-2">
          <button
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
            onClick={() => console.log('Iniciar sesión con Google')}
          >
            Google
          </button>
          <button
            className="flex-1 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            onClick={() => console.log('Iniciar sesión con Facebook')}
          >
            Facebook
          </button>
        </div>
        <button
          className="mt-6 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          onClick={handleVolver}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
