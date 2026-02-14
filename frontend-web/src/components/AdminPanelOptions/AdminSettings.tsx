/**
 * AdminSettings - Configuración del sistema
 */

import React, { useState } from 'react';

interface SettingsForm {
  siteName: string;
  siteDescription: string;
  maxUploadSize: number;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  allowRegistration: boolean;
  commissionPercentage: number;
  defaultShippingCost: number;
  supportEmail: string;
  supportPhone: string;
}

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsForm>({
    siteName: 'Agrotour',
    siteDescription: 'Plataforma de compra de productos agrícolas directamente de productores',
    maxUploadSize: 5,
    maintenanceMode: false,
    emailNotifications: true,
    allowRegistration: true,
    commissionPercentage: 10,
    defaultShippingCost: 5.0,
    supportEmail: 'support@agrotour.com',
    supportPhone: '+57 300 123 4567',
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof SettingsForm, value: any) => {
    setSettings({ ...settings, [field]: value });
    setSaved(false);
  };

  const handleSave = () => {
    // Aquí iría el envío al backend
    console.log('Settings saved:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configuración del Sistema</h2>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
          ✓ Configuración guardada exitosamente
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Site Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Información del Sitio</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Sitio</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                className="w-full border rounded px-3 py-2 h-24"
              />
            </div>
          </div>
        </div>

        {/* Upload Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Configuración de Cargas</h3>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tamaño Máximo de Archivo (MB)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.maxUploadSize}
              onChange={(e) => handleChange('maxUploadSize', parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* System Features */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Características del Sistema</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Modo de Mantenimiento</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Notificaciones por Email</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Permitir Nuevos Registros</span>
            </label>
          </div>
        </div>

        {/* Financial Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Configuración Financiera</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Comisión de Plataforma (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.commissionPercentage}
                onChange={(e) => handleChange('commissionPercentage', parseFloat(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">Porcentaje cobra Agrotour en cada venta</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Costo de Envío por Defecto</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={settings.defaultShippingCost}
                onChange={(e) => handleChange('defaultShippingCost', parseFloat(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Información de Soporte</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email de Soporte</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono de Soporte</label>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) => handleChange('supportPhone', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
        >
          Guardar Configuración
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-4">Zona de Peligro</h3>
        <p className="text-sm text-red-700 mb-4">
          Estas acciones son irreversibles. Úsalas con precaución.
        </p>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Resetear Base de Datos
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
