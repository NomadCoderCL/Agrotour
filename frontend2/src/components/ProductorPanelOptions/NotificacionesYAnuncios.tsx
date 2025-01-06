import React, { useState, useEffect } from "react";

interface Notificacion {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: string; // 'notificacion' o 'aviso'
}

const Notificaciones: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [avisos, setAvisos] = useState<Notificacion[]>([]);
  const [mostrar, setMostrar] = useState<"notificaciones" | "avisos">("notificaciones");
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchNotificaciones = async () => {
      if (!accessToken) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        setCargando(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/notificaciones/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data: Notificacion[] = await response.json();
          // Filtrar notificaciones y avisos basándose en el campo 'tipo'
          const notificacionesFiltered = data.filter(n => n.tipo === 'notificacion');
          const avisosFiltered = data.filter(n => n.tipo === 'aviso');

          setNotificaciones(notificacionesFiltered);
          setAvisos(avisosFiltered);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Error al obtener las notificaciones.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error al conectarse con el servidor.');
      } finally {
        setCargando(false);
      }
    };

    fetchNotificaciones();
  }, [accessToken]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Notificaciones y Avisos</h1>

      {cargando ? (
        <p className="text-gray-600">Cargando notificaciones...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Botones para alternar entre Notificaciones y Avisos */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              className={`py-2 px-4 rounded-lg font-bold ${
                mostrar === "notificaciones" ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white"
              }`}
              aria-label="Mostrar notificaciones"
              onClick={() => setMostrar("notificaciones")}
            >
              Notificaciones
            </button>
            <button
              className={`py-2 px-4 rounded-lg font-bold ${
                mostrar === "avisos" ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white"
              }`}
              aria-label="Mostrar avisos"
              onClick={() => setMostrar("avisos")}
            >
              Avisos
            </button>
          </div>

          {/* Lista de notificaciones o avisos */}
          <div>
            {mostrar === "notificaciones" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-green-600">Notificaciones</h2>
                {notificaciones.length > 0 ? (
                  <ul>
                    {notificaciones.map((notificacion) => (
                      <li key={notificacion.id} className="bg-gray-100 p-4 mb-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">{notificacion.titulo}</h3>
                        <p className="text-sm text-gray-700 mb-2">{notificacion.descripcion}</p>
                        <p className="text-xs text-gray-500">Fecha: {notificacion.fecha}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No hay notificaciones disponibles.</p>
                )}
              </div>
            )}

            {mostrar === "avisos" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-green-600">Avisos</h2>
                {avisos.length > 0 ? (
                  <ul>
                    {avisos.map((aviso) => (
                      <li key={aviso.id} className="bg-gray-100 p-4 mb-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">{aviso.titulo}</h3>
                        <p className="text-sm text-gray-700 mb-2">{aviso.descripcion}</p>
                        <p className="text-xs text-gray-500">Fecha: {aviso.fecha}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No hay avisos disponibles.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Notificaciones;
