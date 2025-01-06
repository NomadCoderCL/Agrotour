import React, { useState, useEffect } from "react";

interface OrdenProducto {
  producto: {
    nombre: string;
  };
  cantidad: number;
  precio: number;
}

interface Purchase {
  id: number;
  fecha_creacion: string;
  total: number;
}

const PurchaseHistory: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [boletaInfo, setBoletaInfo] = useState<OrdenProducto[] | null>(null);
  const [cargandoBoleta, setCargandoBoleta] = useState<boolean>(false);
  const [errorBoleta, setErrorBoleta] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/ventas/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data: Purchase[] = await response.json();
          setPurchases(data);
        } else {
          console.error("Error al obtener las compras:", await response.json());
        }
      } catch (err) {
        console.error("Error al conectarse con el servidor:", err);
      }
    };

    fetchPurchases();
  }, [accessToken]);

  const handleViewReceipt = async (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setBoletaInfo(null);
    setCargandoBoleta(true);
    setErrorBoleta(null);
    setExito(null);

    try {
      const response = await fetch(`http://localhost:8000/api/boleta/${purchase.id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data: {
          productos: OrdenProducto[];
          impuesto: number;
          total: number;
        } = await response.json();

        setBoletaInfo(data.productos);
        setExito(
          `Boleta cargada correctamente. Total: $${(data.total ?? 0).toFixed(2)}, Impuestos: $${(data.impuesto ?? 0).toFixed(2)}`
        );
      } else {
        const errorData = await response.json();
        setErrorBoleta(
          errorData.detail || `Error al obtener la boleta de la compra ${purchase.id}.`
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorBoleta(err.message || 'Error al conectarse con el servidor.');
    } finally {
      setCargandoBoleta(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Historial de Compras</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Lista de Compras */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Últimas Compras</h2>
          <ul className="space-y-4">
            {purchases.map((purchase) => (
              <li
                key={purchase.id}
                className={`p-4 border rounded-lg ${
                  selectedPurchase?.id === purchase.id ? "bg-green-100" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between">
                  <span>{new Date(purchase.fecha_creacion).toLocaleDateString()}</span>
                  <span>${(purchase.total ?? 0).toFixed(2)}</span>
                </div>
                <button
                  onClick={() => handleViewReceipt(purchase)}
                  className="mt-2 bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded"
                >
                  Ver Boleta
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Detalle de Boleta */}
        {selectedPurchase && (
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Boleta de Compra</h2>
            {cargandoBoleta ? (
              <p>Cargando boleta...</p>
            ) : errorBoleta ? (
              <p className="text-red-500">{errorBoleta}</p>
            ) : boletaInfo ? (
              <div>
                <ul className="space-y-2">
                  {boletaInfo.map((producto, index) => (
                    <li key={index}>
                      {producto.producto.nombre} - {producto.cantidad} x $
                      {(producto.precio ?? 0).toFixed(2)}
                    </li>
                  ))}
                </ul>
                {exito && <p className="text-green-500 mt-4">{exito}</p>}
              </div>
            ) : (
              <p>No se encontró información de la boleta.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
