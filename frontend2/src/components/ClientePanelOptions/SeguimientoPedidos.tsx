import React, { useState, useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";

const SeguimientoPedidos = () => {
  const [orderStatus, setOrderStatus] = useState("Preparando pedido");
  const [orderLocation, setOrderLocation] = useState<[number, number]>([
    -74.063644,
    4.624335, // Latitud y longitud
  ]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    // Simula cambios en el estado del pedido cada 5 segundos
    const intervalId = setInterval(() => {
      setOrderStatus((prevStatus) => {
        switch (prevStatus) {
          case "Preparando pedido":
            return "En camino";
          case "En camino":
            return "Entregado";
          default:
            return "Preparando pedido";
        }
      });
    }, 5000);

    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente
  }, []);

  useEffect(() => {
    // Inicializa el mapa solo una vez
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat(orderLocation),
          zoom: 15,
        }),
      });
    } else if (mapInstanceRef.current) {
      // Actualiza la vista del mapa con la nueva ubicación
      mapInstanceRef.current.getView().setCenter(fromLonLat(orderLocation));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.dispose(); // Limpia los recursos del mapa
        mapInstanceRef.current = null;
      }
    };
  }, [orderLocation]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-green-700 mb-4">
        Seguimiento de Pedido
      </h1>
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Estado del pedido */}
        <div className="bg-white rounded-lg shadow-md p-4 flex-1">
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            Estado del Pedido
          </h2>
          <p className="text-lg text-gray-600">{orderStatus}</p>
        </div>

        {/* Mapa con la ubicación del pedido */}
        <div className="bg-white rounded-lg shadow-md p-4 flex-1">
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            Ubicación del Pedido
          </h2>
          <div ref={mapRef} style={{ height: "300px", width: "100%" }}></div>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoPedidos;
