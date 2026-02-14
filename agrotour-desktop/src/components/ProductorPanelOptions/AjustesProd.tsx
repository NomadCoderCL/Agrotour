import React, { useState, useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat, toLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

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

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);

  const handleSaveChanges = () => {
    // Aquí realizarías la llamada a la API para guardar los cambios en el backend (Django).
    console.log('Cambios guardados:', { username, email, location });
  };

  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      // Preparar capa base
      const tileLayer = new TileLayer({
        source: new OSM(),
      });

      // Capa para el marcador
      const vectorSource = new VectorSource();
      vectorSourceRef.current = vectorSource;
      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      // Determinar el centro inicial del mapa
      const initialCenter = location
        ? fromLonLat([location.longitude, location.latitude])
        : fromLonLat([-0.09, 51.505]); // Coordenadas de ejemplo

      const view = new View({
        center: initialCenter,
        zoom: 13,
      });

      // Crear el mapa
      const map = new Map({
        target: mapRef.current,
        layers: [tileLayer, vectorLayer],
        view: view,
      });

      mapInstanceRef.current = map;

      // Si ya hay una ubicación, colocar el marcador
      if (location) {
        const marker = new Feature({
          geometry: new Point(fromLonLat([location.longitude, location.latitude])),
        });
        marker.setStyle(
          new Style({
            image: new Icon({
              src: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg',
              scale: 0.5,
            }),
          })
        );
        vectorSource.addFeature(marker);
      }

      // Evento click en el mapa para seleccionar ubicación
      map.on('click', (e) => {
        const [selectedLon, selectedLat] = toLonLat(e.coordinate);
        setLocation({ latitude: selectedLat, longitude: selectedLon });

        // Limpiar cualquier marcador previo
        vectorSource.clear();

        // Agregar marcador en la nueva ubicación
        const newMarker = new Feature({
          geometry: new Point(fromLonLat([selectedLon, selectedLat])),
        });
        newMarker.setStyle(
          new Style({
            image: new Icon({
              src: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg',
              scale: 0.5,
            }),
          })
        );
        vectorSource.addFeature(newMarker);
      });
    }

    // Si se oculta el mapa, limpiar la instancia (opcional)
    return () => {
      if (!showMap && mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [showMap, location]);

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
          <div className="w-full h-96" ref={mapRef}></div>
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
