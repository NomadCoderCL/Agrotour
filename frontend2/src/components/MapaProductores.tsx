import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API_URL, fetchWithAuth, handleApiError } from '../lib/utils';

// Fix Leaflet Default Icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Ubicacion {
    id: number;
    latitud: number;
    longitud: number;
    direccion: string;
    productor_nombre: string; // Assuming we serialize this from backend
}

const MapaProductores: React.FC = () => {
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargarUbicaciones = async () => {
            try {
                // We'll need to ensure this endpoint exists and returns what we expect
                // Using existing 'ubicaciones_productores' view from views.py linked to 'api/ubicaciones/'?
                // Let's assume standard ModelViewSet 'api/ubicaciones/'
                const response = await fetchWithAuth(`${API_URL}/api/ubicaciones/`, {
                    method: 'GET'
                });

                if (!response.ok) throw new Error('Error al cargar ubicaciones');

                const data = await response.json();
                // Map backend data to interface if needed, assuming direct match for now
                setUbicaciones(data);
            } catch (err: any) {
                // handleApiError(err, setError); // Optional: silent fail or show error
                console.error("Error loading map data:", err);
                setError("No se pudieron cargar los mapas.");
            } finally {
                setCargando(false);
            }
        };

        cargarUbicaciones();
    }, []);

    if (cargando) return <div className="p-4 text-center">Cargando mapa...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    // Default center (Chile roughly) or average of points
    const center: [number, number] = [-35.6751, -71.5430];

    return (
        <div className="h-[500px] w-full border rounded-lg shadow-md overflow-hidden bg-gray-100">
            <MapContainer center={center} zoom={5} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {ubicaciones.map((ubi) => (
                    // Safety check for valid coordinates
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
