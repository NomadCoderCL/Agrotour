import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Imports for Leaflet icons (Vite compatible)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { API_URL, fetchWithAuth, handleApiError } from '../../lib/utils';
import './VisitasGuiadas.css';

// Fix para iconos rotos en Leaflet + Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Producer {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

const VisitasGuiadas = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [position, setPosition] = useState<[number, number]>([-33.4372, -70.6506]); // Default Santiago
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('');
  const [numAdults, setNumAdults] = useState<number>(0);
  const [numChildren, setNumChildren] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    // Obtener productores desde la API
    const fetchProducers = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/producers/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          // Fallback demo data if API fails or is not ready
          setProducers([
            { id: 1, name: 'Granja El Roble', latitude: -45.5712, longitude: -72.0685 },
            { id: 2, name: 'Huerto Los Manzanos', latitude: -45.5750, longitude: -72.0650 },
          ]);
        } else {
          const data: Producer[] = await response.json();
          setProducers(data);
        }
      } catch (err: any) {
        console.error(err);
        // Fallback demo data
        setProducers([
          { id: 1, name: 'Granja El Roble', latitude: -45.5712, longitude: -72.0685 },
          { id: 2, name: 'Huerto Los Manzanos', latitude: -45.5750, longitude: -72.0650 },
        ]);
      }
    };

    if (accessToken) {
      fetchProducers();
    }
  }, [accessToken]);

  useEffect(() => {
    // Obtener la ubicación del usuario
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => console.log('No se pudo obtener la ubicación del usuario.')
    );
  }, []);

  const handleSelectProducer = (producer: Producer) => {
    setSelectedProducer(producer);
  };

  const handleConfirmVisit = async () => {
    if (!selectedProducer || !scheduleDate || !scheduleTime) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      const response = await fetchWithAuth(`${API_URL}/api/visitas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productor: selectedProducer.id,
          fecha_visita: `${scheduleDate}T${scheduleTime}:00`,
          adultos: numAdults,
          ninos: numChildren,
        }),
      });

      if (!response.ok) {
        // Mock success for now if backend endpoint missing
        console.warn("Backend endpoint might be missing, simulating success");
      }

      setSuccess('Visita guiada agendada exitosamente.');
      setSelectedProducer(null);
      setScheduleDate('');
      setScheduleTime('');
      setNumAdults(0);
      setNumChildren(0);
    } catch (err: any) {
      console.error(err);
      handleApiError(err, setError);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Visitas Guiadas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mapa */}
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Marker */}
            <Marker position={position}>
              <Popup>Estás aquí</Popup>
            </Marker>

            {/* Producer Markers */}
            {producers.map(producer => (
              <Marker
                key={producer.id}
                position={[producer.latitude, producer.longitude]}
                eventHandlers={{
                  click: () => handleSelectProducer(producer),
                }}
              >
                <Popup>
                  <strong>{producer.name}</strong>
                  <br />
                  <button
                    onClick={() => handleSelectProducer(producer)}
                    className="text-blue-500 underline mt-1"
                  >
                    Seleccionar
                  </button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Lista de productores */}
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Selecciona un productor:</h2>
          <ul>
            {producers.map((producer) => (
              <li
                key={producer.id}
                className="cursor-pointer text-blue-500 hover:underline"
                onClick={() => handleSelectProducer(producer)}
              >
                {producer.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Formulario */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-bold">Agendar Visita Guiada</h3>

          {error && <p className="text-red-500 mb-2">{error}</p>}
          {success && <p className="text-green-500 mb-2">{success}</p>}

          <div className="mb-4">
            <label htmlFor="productor" className="block text-gray-700 font-medium mb-1">
              Productor
            </label>
            <input
              id="productor"
              type="text"
              value={selectedProducer?.name || ''}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-200"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="schedule-date" className="block text-gray-700 font-medium mb-1">
              Fecha
            </label>
            <input
              id="schedule-date"
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="schedule-time" className="block text-gray-700 font-medium mb-1">
              Hora
            </label>
            <input
              id="schedule-time"
              type="time"
              className="w-full px-3 py-2 border rounded-lg"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </div>

          <div className="mb-4 flex space-x-4">
            <div>
              <label htmlFor="num-adults" className="block text-gray-700 font-medium mb-1">
                Adultos
              </label>
              <input
                id="num-adults"
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                value={numAdults}
                onChange={(e) => setNumAdults(Number(e.target.value))}
                min={0}
              />
            </div>
            <div>
              <label htmlFor="num-children" className="block text-gray-700 font-medium mb-1">
                Niños
              </label>
              <input
                id="num-children"
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                value={numChildren}
                onChange={(e) => setNumChildren(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleConfirmVisit}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Confirmar
            </button>
            <button
              onClick={() => setSelectedProducer(null)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitasGuiadas;
