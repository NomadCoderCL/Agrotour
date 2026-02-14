import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Imports for Leaflet icons (Vite compatible)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix para iconos rotos en Leaflet + Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Definir interfaces para los datos
interface Ubicacion {
  latitude: number;
  longitude: number;
}

interface Envio {
  id: number;
  estado: 'Pendiente' | 'En camino' | 'Entregado';
  ubicacion: Ubicacion;
}

const EnvioDomicilio = () => {
  // Datos de prueba (Coyhaique y alrededores)
  const [envios, setEnvios] = useState<Envio[]>([
    { id: 1, estado: 'Pendiente', ubicacion: { latitude: -45.5712, longitude: -72.0685 } },
    { id: 2, estado: 'En camino', ubicacion: { latitude: -45.5750, longitude: -72.0650 } },
    { id: 3, estado: 'Entregado', ubicacion: { latitude: -45.5800, longitude: -72.0700 } },
  ]);

  const actualizarEstado = (id: number, estado: 'Pendiente' | 'En camino' | 'Entregado') => {
    setEnvios(envios.map((envio) => (envio.id === id ? { ...envio, estado } : envio)));
  };

  // Centro del mapa (Coyhaique)
  const center: [number, number] = [-45.5712, -72.0685];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Envío a Domicilio</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {envios.map((envio) => (
          <div key={envio.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-gray-800">Pedido #{envio.id}</h2>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${envio.estado === 'Entregado' ? 'bg-green-100 text-green-800' :
                  envio.estado === 'En camino' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                {envio.estado}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Ubicación: {envio.ubicacion.latitude.toFixed(4)}, {envio.ubicacion.longitude.toFixed(4)}
            </p>

            <div className="flex gap-2">
              <button
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold py-1 px-2 rounded"
                onClick={() => actualizarEstado(envio.id, 'Pendiente')}
              >
                Pendiente
              </button>
              <button
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-2 rounded"
                onClick={() => actualizarEstado(envio.id, 'En camino')}
              >
                En camino
              </button>
              <button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-2 rounded"
                onClick={() => actualizarEstado(envio.id, 'Entregado')}
              >
                Entregado
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-96 w-full relative z-0">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {envios.map((envio) => (
            <Marker key={envio.id} position={[envio.ubicacion.latitude, envio.ubicacion.longitude]}>
              <Popup>
                <strong>Pedido #{envio.id}</strong><br />
                Estado: {envio.estado}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default EnvioDomicilio;
