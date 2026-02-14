/**
 * NotificationCenter - Centro de notificaciones (Campanita)
 * MASTER FILE §7: Centro de notificaciones para avisos de pedidos
 * Dropdown con lista de notificaciones y badge de pendientes
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Package, ShoppingCart, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface Notification {
    id: string;
    type: 'order' | 'delivery' | 'alert' | 'success' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

// Demo notifications (se reemplazarán con datos reales del backend)
const DEMO_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'info',
        title: 'Bienvenido a Agrotour',
        message: 'Explora productos locales de la Patagonia y conecta con productores.',
        timestamp: new Date(),
        read: false,
    },
    {
        id: '2',
        type: 'success',
        title: 'Plataforma Lista',
        message: 'Todas las funcionalidades están activas. ¡Comienza a explorar!',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
    },
];

const iconMap: Record<string, React.ReactNode> = {
    order: <ShoppingCart className="w-4 h-4 text-blue-500" />,
    delivery: <Package className="w-4 h-4 text-purple-500" />,
    alert: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    success: <CheckCircle className="w-4 h-4 text-green-500" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
};

interface NotificationCenterProps {
    className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const formatTime = (date: Date) => {
        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours}h`;
        return `Hace ${Math.floor(hours / 24)}d`;
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Notificaciones"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                            Notificaciones
                            {unreadCount > 0 && (
                                <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                                    {unreadCount} nuevas
                                </span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                                Marcar todo
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sin notificaciones</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => markAsRead(n.id)}
                                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors flex gap-3 ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                        }`}
                                >
                                    <div className="mt-0.5 flex-shrink-0">
                                        {iconMap[n.type] || iconMap.info}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm font-medium truncate ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {n.title}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeNotification(n.id);
                                                }}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{formatTime(n.timestamp)}</p>
                                    </div>
                                    {!n.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
