import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Visit {
  id: number;
  producerName: string;
  location: { latitude: number; longitude: number };
  date: string;
  time: string;
  status: 'Pendiente' | 'Confirmada' | 'Cancelada';
}

const sampleVisits: Visit[] = [
  {
    id: 1,
    producerName: 'Productor 1',
    location: { latitude: 19.4326, longitude: -99.1332 },
    date: '2024-12-15',
    time: '10:00',
    status: 'Pendiente',
  },
  {
    id: 2,
    producerName: 'Productor 2',
    location: { latitude: 19.4328, longitude: -99.1335 },
    date: '2024-12-16',
    time: '14:00',
    status: 'Confirmada',
  },
];

const AgendaVisitas = () => {
  const [visits, setVisits] = useState<Visit[]>(sampleVisits);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const handleCancelVisit = (id: number) => {
    setVisits((prevVisits) =>
      prevVisits.map((visit) =>
        visit.id === id ? { ...visit, status: 'Cancelada' } : visit
      )
    );
  };

  const handleConfirmVisit = (id: number) => {
    setVisits((prevVisits) =>
      prevVisits.map((visit) =>
        visit.id === id ? { ...visit, status: 'Confirmada' } : visit
      )
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        Agenda de Visitas Guiadas
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {visit.producerName}
            </h2>
            <p className="text-gray-700">Fecha: {visit.date}</p>
            <p className="text-gray-700">Hora: {visit.time}</p>
            <p
              className={`font-bold mt-2 ${
                visit.status === 'Pendiente'
                  ? 'text-yellow-500'
                  : visit.status === 'Confirmada'
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              Estado: {visit.status}
            </p>
            <div className="flex justify-between mt-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => handleConfirmVisit(visit.id)}
                disabled={visit.status === 'Confirmada'}
              >
                Confirmar
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => handleCancelVisit(visit.id)}
                disabled={visit.status === 'Cancelada'}
              >
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedVisit && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-green-700">
            Detalle de la Visita
          </h2>
          <p className="text-gray-700 mt-4">
            Productor: {selectedVisit.producerName}
          </p>
          <p className="text-gray-700">
            Ubicación: {selectedVisit.location.latitude},{' '}
            {selectedVisit.location.longitude}
          </p>
          <MapContainer
            center={[
              selectedVisit.location.latitude,
              selectedVisit.location.longitude,
            ]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[
                selectedVisit.location.latitude,
                selectedVisit.location.longitude,
              ]}
            >
              <Popup>
                {selectedVisit.producerName} <br /> {selectedVisit.date} a las{' '}
                {selectedVisit.time}
              </Popup>
            </Marker>
          </MapContainer>
          <button
            className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setSelectedVisit(null)}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default AgendaVisitas;
