import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Icon } from 'ol/style';
import './EnvioDomicilio.css';

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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [envios, setEnvios] = useState<Envio[]>([
    { id: 1, estado: 'Pendiente', ubicacion: { latitude: 37.78825, longitude: -122.4324 } },
    { id: 2, estado: 'En camino', ubicacion: { latitude: 37.78835, longitude: -122.4325 } },
    { id: 3, estado: 'Entregado', ubicacion: { latitude: 37.78845, longitude: -122.4326 } },
  ]);

  const [ubicacionActual, setUbicacionActual] = useState<Ubicacion>({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  useEffect(() => {
    const map = new Map({
      target: mapRef.current as HTMLDivElement,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([ubicacionActual.longitude, ubicacionActual.latitude]),
        zoom: 13,
      }),
    });

    const marker = new Feature({
      geometry: new Point(fromLonLat([ubicacionActual.longitude, ubicacionActual.latitude])),
    });

    marker.setStyle(
      new Style({
        image: new Icon({
          src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          scale: 0.05,
        }),
      })
    );

    const vectorLayer = new VectorLayer({
      source: new VectorSource({ features: [marker] }),
    });

    map.addLayer(vectorLayer);

    return () => map.setTarget(undefined); // Cambiar `null` a `undefined`
  }, [ubicacionActual]);

  const actualizarEstado = (id: number, estado: 'Pendiente' | 'En camino' | 'Entregado') => {
    setEnvios(envios.map((envio) => (envio.id === id ? { ...envio, estado } : envio)));
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Envío a Domicilio</h1>

      <div className="flex flex-wrap justify-between gap-4 mb-8">
        {envios.map((envio) => (
          <div key={envio.id} className="bg-white rounded-lg shadow-md p-4 flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Pedido #{envio.id}</h2>
            <p className="text-gray-700 mb-2">Estado: {envio.estado}</p>
            <p className="text-gray-700">
              Ubicación: {envio.ubicacion.latitude.toFixed(4)}, {envio.ubicacion.longitude.toFixed(4)}
            </p>

            <div className="flex justify-between mt-4">
              <button
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded"
                onClick={() => actualizarEstado(envio.id, 'Pendiente')}
              >
                Pendiente
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                onClick={() => actualizarEstado(envio.id, 'En camino')}
              >
                En camino
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                onClick={() => actualizarEstado(envio.id, 'Entregado')}
              >
                Entregado
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-100 rounded-lg shadow-md p-4 h-96">
        <div ref={mapRef} className="map-container"></div>
      </div>
    </div>
  );
};

export default EnvioDomicilio;
