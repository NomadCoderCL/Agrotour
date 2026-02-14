import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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

// Componente auxiliar para manejar clicks en el mapa
const LocationMarker = ({ setLocation }: { setLocation: (loc: Location) => void }) => {
  useMapEvents({
    click(e) {
      setLocation({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
    },
  });
  return null;
};

// Tipo para la ubicación
interface Location {
  latitude: number;
  longitude: number;
}

const AjustesProd: React.FC = () => {
  const [username, setUsername] = useState('Usuario123');
  const [email, setEmail] = useState('usuario@example.com');
  const [location, setLocation] = useState<Location | null>(null);
  const [showMap, setShowMap] = useState(false);

  const handleSaveChanges = () => {
    // Aquí realizarías la llamada a la API para guardar los cambios en el backend (Django).
    console.log('Cambios guardados:', { username, email, location });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-md max-w-md">
      <h2 className="text-lg font-bold mb-4">Ajustes de Productor</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Nombre de usuario
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Correo electrónico
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Ubicación del lugar de producción
          </label>
          {location && (
            <p className="text-sm text-gray-600 mb-2">
              Latitud: {location.latitude}, Longitud: {location.longitude}
            </p>
          )}
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
            onClick={() => setShowMap(true)}
          >
            {location ? 'Actualizar Ubicación' : 'Seleccionar Ubicación'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleSaveChanges}
          >
            Guardar cambios
          </button>
        </div>
      </form>

      {showMap && (
        <div className="mt-4 w-full h-auto">
          <h3 className="text-md font-bold mb-2">Seleccionar Ubicación</h3>
          <div className="w-full h-96 relative z-0">
            <MapContainer
              center={location ? [location.latitude, location.longitude] : [-0.09, 51.505]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker setLocation={setLocation} />
              {location && <Marker position={[location.latitude, location.longitude]} />}
            </MapContainer>
          </div>
          <div className="mt-2">
            <button
              type="button"
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setShowMap(false)}
            >
              Cerrar mapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AjustesProd;
