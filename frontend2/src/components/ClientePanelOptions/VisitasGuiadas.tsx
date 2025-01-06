import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

interface Producer {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

const VisitasGuiadas = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [position, setPosition] = useState<[number, number]>([19.4326, -99.1332]);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('');
  const [numAdults, setNumAdults] = useState<number>(0);
  const [numChildren, setNumChildren] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    // Obtener productores desde la API
    const fetchProducers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/producers/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los productores.');
        }

        const data: Producer[] = await response.json();
        setProducers(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error al conectarse con el servidor.');
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

  useEffect(() => {
    // Inicializar el mapa solo una vez
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([position[1], position[0]]),
          zoom: 13,
        }),
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.dispose();
        mapInstanceRef.current = null;
      }
    };
  }, [position]);

  const handleSelectProducer = (producer: Producer) => {
    setSelectedProducer(producer);
  };

  const handleConfirmVisit = async () => {
    if (!selectedProducer || !scheduleDate || !scheduleTime) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/visitas/', {
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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al agendar la visita.');
      }

      setSuccess('Visita guiada agendada exitosamente.');
      setSelectedProducer(null);
      setScheduleDate('');
      setScheduleTime('');
      setNumAdults(0);
      setNumChildren(0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al conectarse con el servidor.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Visitas Guiadas</h1>

      {/* Mapa */}
      <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>

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
  );
};

export default VisitasGuiadas;
