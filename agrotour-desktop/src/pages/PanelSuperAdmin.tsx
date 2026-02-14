/**
 * PanelSuperAdmin - "Sala de Máquinas"
 * Panel de control técnico para el Mantenedor del sistema.
 * Acceso restringido a rol 'superuser'.
 */

import React, { useState } from 'react';
import { PanelLayout, PanelMenuItem } from '../components/layouts/PanelLayout';
import { useAuth } from '../contexts/AuthContext';

// Sub-secciones del Super Admin
const SECTIONS = {
    DASHBOARD: 'dashboard',
    USERS: 'users',
    SYSTEM: 'system',
    FEATURES: 'features',
    LOGS: 'logs',
    CONFIG: 'config',
} as const;

type SectionKey = typeof SECTIONS[keyof typeof SECTIONS];

const PanelSuperAdmin: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState<SectionKey>(SECTIONS.DASHBOARD);

    const menuItems: PanelMenuItem[] = [
        { id: SECTIONS.DASHBOARD, label: 'Dashboard', icon: '🎛️', onClick: () => setActiveSection(SECTIONS.DASHBOARD) },
        { id: SECTIONS.USERS, label: 'Gestión de Usuarios', icon: '👥', onClick: () => setActiveSection(SECTIONS.USERS) },
        { id: SECTIONS.SYSTEM, label: 'System Health', icon: '💚', onClick: () => setActiveSection(SECTIONS.SYSTEM) },
        { id: SECTIONS.FEATURES, label: 'Feature Flags', icon: '🚩', onClick: () => setActiveSection(SECTIONS.FEATURES) },
        { id: SECTIONS.LOGS, label: 'Logs & Errores', icon: '📋', onClick: () => setActiveSection(SECTIONS.LOGS) },
        { id: SECTIONS.CONFIG, label: 'Configuración Global', icon: '⚙️', onClick: () => setActiveSection(SECTIONS.CONFIG) },
    ];

    const renderSection = () => {
        switch (activeSection) {
            case SECTIONS.DASHBOARD:
                return <DashboardSection />;
            case SECTIONS.USERS:
                return <UsersSection />;
            case SECTIONS.SYSTEM:
                return <SystemHealthSection />;
            case SECTIONS.FEATURES:
                return <FeatureFlagsSection />;
            case SECTIONS.LOGS:
                return <LogsSection />;
            case SECTIONS.CONFIG:
                return <ConfigSection />;
            default:
                return <DashboardSection />;
        }
    };

    return (
        <PanelLayout
            title="Sala de Máquinas"
            menuItems={menuItems}
            activeMenuItem={activeSection}
            userRole="Super Admin"
            userName={user?.username || 'Mantenedor'}
            onLogout={logout}
        >
            {renderSection()}
        </PanelLayout>
    );
};

// ============================================
// SUB-SECCIONES
// ============================================

const DashboardSection: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Control Técnico</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
                { label: 'Usuarios Activos', value: '—', icon: '👥', color: 'bg-blue-500' },
                { label: 'Pedidos Hoy', value: '—', icon: '📦', color: 'bg-green-500' },
                { label: 'Errores (24h)', value: '—', icon: '⚠️', color: 'bg-yellow-500' },
                { label: 'Sync Pendientes', value: '—', icon: '🔄', color: 'bg-purple-500' },
            ].map(({ label, value, icon, color }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
                        <span className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-white text-sm`}>{icon}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
            ))}
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Nota:</strong> Los datos en tiempo real se conectarán cuando el backend esté en staging. Actualmente muestra placeholders.
            </p>
        </div>
    </div>
);

const UsersSection: React.FC = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Buscar Usuario
            </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Acciones disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { action: 'Resetear Contraseña', desc: 'Enviar enlace de reset por email', icon: '🔑' },
                        { action: 'Bloquear Usuario', desc: 'Suspender cuenta por actividad sospechosa', icon: '🚫' },
                        { action: 'Editar Roles', desc: 'Ascender Cliente a Productor, etc.', icon: '👤' },
                    ].map(({ action, desc, icon }) => (
                        <div key={action} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer">
                            <div className="text-2xl mb-2">{icon}</div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{action}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const SystemHealthSection: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
                { service: 'Backend API', status: 'Desconocido', statusColor: 'text-gray-500', icon: '🌐' },
                { service: 'Base de Datos', status: 'Desconocido', statusColor: 'text-gray-500', icon: '🗄️' },
                { service: 'Redis (WebSockets)', status: 'Desconocido', statusColor: 'text-gray-500', icon: '⚡' },
                { service: 'Sync Engine', status: 'Desconocido', statusColor: 'text-gray-500', icon: '🔄' },
            ].map(({ service, status, statusColor, icon }) => (
                <div key={service} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
                    <span className="text-2xl">{icon}</span>
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{service}</h3>
                        <p className={`text-sm font-medium ${statusColor}`}>{status}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const FeatureFlagsSection: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Flags</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                    { flag: 'Analítica Avanzada Productores', desc: 'Gráficos detallados de ventas y tendencias', enabled: false },
                    { flag: 'Sistema de Reviews', desc: 'Calificaciones y reseñas de productos', enabled: false },
                    { flag: 'Chat Productor-Cliente', desc: 'Mensajería directa entre usuarios', enabled: false },
                    { flag: 'IA Recomendador', desc: 'Recomendaciones personalizadas (Qwen)', enabled: false },
                    { flag: 'Modo Premium Productor', desc: 'Funciones avanzadas para productores Premium', enabled: false },
                ].map(({ flag, desc, enabled }) => (
                    <div key={flag} className="p-4 flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{flag}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                        </div>
                        <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const LogsSection: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Logs y Errores</h2>
        <div className="bg-gray-900 rounded-xl p-5 font-mono text-sm text-green-400 max-h-96 overflow-y-auto">
            <p className="text-gray-500 mb-3"># Últimos logs del sistema</p>
            <p>[INFO] Sistema inicializado correctamente</p>
            <p>[INFO] Esperando conexión con backend...</p>
            <p className="text-yellow-400">[WARN] Backend no accesible — modo offline activado</p>
            <p className="text-gray-500 mt-3"># Los logs en tiempo real se mostrarán cuando el backend esté conectado</p>
        </div>
    </div>
);

const ConfigSection: React.FC = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración Global</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comisión de Plataforma (%)
                </label>
                <input
                    type="number"
                    defaultValue={15}
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Porcentaje que retiene la plataforma por cada venta (actual: 85/15)</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL del Backend API
                </label>
                <input
                    type="text"
                    defaultValue="http://localhost:8000/api"
                    className="w-full max-w-lg px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    readOnly
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Modo de Sincronización
                </label>
                <select className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Auto (cada 30s)</option>
                    <option>Manual</option>
                    <option>Desactivado</option>
                </select>
            </div>
        </div>
    </div>
);

export default PanelSuperAdmin;
