/**
 * ManageUsers - Sección para gestionar usuarios (admin)
 */

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import getLogger from '@/lib/logger';

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

  useEffect(() => {
    // Mock data - en producción, llamar a API
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'juan_perez',
        email: 'juan@example.com',
        role: 'cliente',
        is_active: true,
        created_at: '2026-01-15',
      },
      {
        id: '2',
        username: 'maria_productor',
        email: 'maria@example.com',
        role: 'productor',
        is_active: true,
        created_at: '2026-01-20',
      },
      {
        id: '3',
        username: 'admin_user',
        email: 'admin@example.com',
        role: 'admin',
        is_active: true,
        created_at: '2026-01-01',
      },
    ];

    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const filteredUsers = filter === 'todos' ? users : users.filter((u) => u.role === filter);

  const handleToggleActive = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
    );
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
            className={`px-4 py-2 rounded-lg ${
              filter === role
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
                    className={`px-2 py-1 rounded text-sm ${
                      user.role === 'admin'
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
