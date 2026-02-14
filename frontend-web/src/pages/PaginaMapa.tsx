import React from 'react';
import MapaProductores from '../components/MapaProductores';
import { useNavigate } from 'react-router-dom';

const PaginaMapa: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-green-800">Mapa de Productores</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Volver
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <p className="mb-4 text-gray-600">
                        Explora la ubicación de nuestros productores asociados. Haz clic en los marcadores para ver más detalles.
                    </p>
                    <MapaProductores />
                </div>
            </div>
        </div>
    );
};

export default PaginaMapa;
