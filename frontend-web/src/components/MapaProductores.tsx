import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Imports for Leaflet icons (Vite compatible)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { API_URL, fetchWithAuth } from '../lib/utils';

// Fix para iconos rotos en Leaflet + Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface Ubicacion {
    id: number;
    latitud: number;
    longitud: number;
    direccion?: string;
    productor_nombre?: string;
}

const MapaProductores: React.FC = () => {
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [loading, setLoading] = useState(true);

    // Coordenadas de Coyhaique
    const coyhaiqueCoords: [number, number] = [-45.5712, -72.0685];

    useEffect(() => {
        const cargarUbicaciones = async () => {
            try {
                // Fetch de ubicaciones desde el backend
                const response = await fetchWithAuth(`${API_URL}/api/ubicaciones/`, {
                    method: 'GET'
                });

                if (response.ok) {
                    const data = await response.json();
                    setUbicaciones(data);
                }
            } catch (err) {
                console.error("Error al cargar ubicaciones del mapa:", err);
            } finally {
                setLoading(false);
            }
        };

        cargarUbicaciones();
    }, []);

    return (
        <div className="w-full h-[500px] z-0 relative border rounded-lg shadow-md overflow-hidden bg-white">
            <MapContainer
                center={coyhaiqueCoords}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marcador de Prueba (Coyhaique) */}
                <Marker position={coyhaiqueCoords}>
                    <Popup>
                        <strong>Coyhaique, Chile</strong><br />
                        Punto de Prueba
                    </Popup>
                </Marker>

                {/* Marcadores de Productores */}
                {ubicaciones.map((ubi) => (
                    (ubi.latitud && ubi.longitud) && (
                        <Marker key={ubi.id} position={[ubi.latitud, ubi.longitud]}>
                            <Popup>
                                <strong>{ubi.productor_nombre || "Productor"}</strong> <br />
                                {ubi.direccion}
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default MapaProductores;
