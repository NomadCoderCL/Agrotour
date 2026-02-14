/**
 * ManageUsers - Sección para gestionar usuarios (admin)
 */

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import getLogger from '@/lib/logger';
import { API_URL, fetchWithAuth } from '@/lib/utils';

const logger = getLogger('ManageUsers');

interface User {
  id: string;
  username: string;
  email: string;
  role: 'cliente' | 'productor' | 'admin';
  is_active: boolean;
  created_at: string;
}

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'cliente' | 'productor' | 'admin'>('todos');

  /* 
    Updated to fetch real data from API 
    Endpoint: /api/users/ (Requires Admin/Superuser)
  */

  const fetchUsers = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) return;

      const response = await fetchWithAuth(`${API_URL}/api/users/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Map API response if needed, for now assuming it matches
        setUsers(data);
      }
    } catch (error) {
      logger.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = filter === 'todos' ? users : users.filter((u) => u.role === filter);

  const handleToggleActive = async (userId: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetchWithAuth(`${API_URL}/api/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ is_active: !userToUpdate.is_active })
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
        );
      } else {
        alert("Error al actualizar usuario");
      }
    } catch (error) {
      logger.error('Error updating user status', error);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestionar Usuarios</h2>

      <div className="flex gap-2">
        {(['todos', 'cliente', 'productor', 'admin'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={`px-4 py-2 rounded-lg ${filter === role
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Usuario</th>
              <th className="border p-3 text-left">Email</th>
              <th className="border p-3 text-left">Rol</th>
              <th className="border p-3 text-center">Activo</th>
              <th className="border p-3 text-left">Desde</th>
              <th className="border p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border p-3">{user.username}</td>
                <td className="border p-3 text-sm">{user.email}</td>
                <td className="border p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${user.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : user.role === 'productor'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                      }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="border p-3 text-center">
                  <input
                    type="checkbox"
                    checked={user.is_active}
                    onChange={() => handleToggleActive(user.id)}
                  />
                </td>
                <td className="border p-3 text-sm">{user.created_at}</td>
                <td className="border p-3 text-center">
                  <button className="text-blue-600 hover:underline">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
