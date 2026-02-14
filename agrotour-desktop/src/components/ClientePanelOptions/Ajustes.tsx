import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Ajustes: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatNewPassword, setRepeatNewPassword] = useState('');
  const [problemReport, setProblemReport] = useState('');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:8000/auth/userinfo/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'No se pudo obtener la información del usuario.');
        }

        const data = await response.json();
        setUsername(data.username);
        setEmail(data.email);
      } catch (err: any) {
        console.error('Error al obtener información del usuario:', err);
        setError(err.message || 'Error al conectarse con el servidor.');
      }
    };

    if (accessToken) {
      fetchUserInfo();
    } else {
      navigate('/login');
    }
  }, [accessToken, navigate]);

  const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('http://localhost:8000/auth/userinfo/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ username, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar los cambios.');
      }

      setSuccessMessage('Cambios guardados exitosamente.');
    } catch (err: any) {
      console.error('Error al guardar cambios:', err);
      setError(err.message || 'Error al conectarse con el servidor.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== repeatNewPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/auth/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al cambiar la contraseña.');
      }

      setSuccessMessage('Contraseña cambiada exitosamente.');
      setCurrentPassword('');
      setNewPassword('');
      setRepeatNewPassword('');
    } catch (err: any) {
      console.error('Error al cambiar contraseña:', err);
      setError(err.message || 'Error al conectarse con el servidor.');
    }
  };

  const handleDeleteAccount = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('http://localhost:8000/auth/user/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar la cuenta.');
      }

      localStorage.clear();
      navigate('/');
    } catch (err: any) {
      console.error('Error al eliminar cuenta:', err);
      setError(err.message || 'Error al conectarse con el servidor.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Ajustes</h2>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      {/* Guardar Cambios */}
      <form onSubmit={handleSaveChanges}>
        <div className="mb-4">
          <label htmlFor="username" className="block font-bold">Nombre de usuario</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block font-bold">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg">
          Guardar cambios
        </button>
      </form>

      {/* Cambiar Contraseña */}
      <form onSubmit={handlePasswordChange} className="mt-6">
        <h3 className="font-bold mb-4">Cambiar Contraseña</h3>
        <div className="mb-4">
          <label htmlFor="currentPassword" className="block font-bold">Contraseña actual</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="newPassword" className="block font-bold">Nueva contraseña</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="repeatNewPassword" className="block font-bold">Repetir nueva contraseña</label>
          <input
            id="repeatNewPassword"
            type="password"
            value={repeatNewPassword}
            onChange={(e) => setRepeatNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Cambiar contraseña
        </button>
      </form>

      {/* Eliminar Cuenta */}
      <div className="mt-6">
        <h3 className="font-bold text-red-500">Eliminar cuenta</h3>
        <button
          onClick={() => setShowDeleteAccountModal(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Eliminar cuenta
        </button>
        {showDeleteAccountModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg">
              <p>¿Estás seguro de que deseas eliminar tu cuenta?</p>
              <button onClick={handleDeleteAccount} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                Confirmar
              </button>
              <button onClick={() => setShowDeleteAccountModal(false)} className="bg-gray-300 px-4 py-2 rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ajustes;
