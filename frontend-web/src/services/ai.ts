
/**
 * AI Service - Mock implementation for the Chat Assistant
 * Future integration: Connect to /api/ai/chat endpoint
 */

import { fetchWithAuth, API_URL } from '../lib/utils';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Mock responses for now
const MOCK_RESPONSES = [
    "¡Hola! Soy el asistente virtual de Agrotour. ¿En qué puedo ayudarte hoy?",
    "Puedo ayudarte a encontrar productos, gestionar tus pedidos o resolver dudas sobre la plataforma.",
    "Esa es una excelente pregunta. Dejame buscar la información...",
    "Por el momento sigo en entrenamiento, pero pronto podré responderte con más precisión.",
    "Recuerda que puedes ver el estado de tus pedidos en la sección 'Mis Pedidos'.",
];

export const sendMessageToAI = async (message: string): Promise<string> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // TODO: Replace with real API call when backend is ready
    // const response = await fetchWithAuth(`${API_URL}/api/ai/chat/`, {
    //   method: 'POST',
    //   body: JSON.stringify({ message }),
    // });
    // const data = await response.json();
    // return data.response;

    // Return random mock response
    const randomResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    return randomResponse;
};
