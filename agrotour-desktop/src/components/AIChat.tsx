import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AIChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await invoke<{ response: string; model: string }>('ai_chat', {
                prompt: input,
                context: null,
            });

            const assistantMessage: Message = {
                role: 'assistant',
                content: response.response,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error: ${error}. Asegúrate de que Ollama esté corriendo con el modelo qwen2.5:3b-instruct`,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const analyzeStock = async () => {
        setIsLoading(true);
        try {
            const response = await invoke<string>('ai_analyze_stock', {
                productName: 'Tomates',
                salesData: '150 kg vendidos',
                currentStock: 50,
            });

            const assistantMessage: Message = {
                role: 'assistant',
                content: response,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Stock Analysis Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px' }}>
            <h1>🤖 Asistente IA Agrotour</h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Modelo: Qwen2.5-3B (Offline) | Asegúrate de tener Ollama corriendo
            </p>

            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px',
                    backgroundColor: '#f9f9f9',
                }}
            >
                {messages.length === 0 && (
                    <div style={{ color: '#999', textAlign: 'center', marginTop: '50px' }}>
                        <p>Pregúntame sobre:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li>📊 Análisis de stock</li>
                            <li>💰 Recomendaciones de precios</li>
                            <li>✍️ Generación de descripciones</li>
                            <li>🌾 Consejos agrícolas</li>
                        </ul>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            marginBottom: '15px',
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#fff',
                            border: msg.role === 'assistant' ? '1px solid #e0e0e0' : 'none',
                        }}
                    >
                        <strong>{msg.role === 'user' ? '👤 Tú' : '🤖 IA'}:</strong>
                        <p style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                    </div>
                ))}

                {isLoading && (
                    <div style={{ textAlign: 'center', color: '#666' }}>
                        <p>⏳ Pensando...</p>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button
                    onClick={analyzeStock}
                    disabled={isLoading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                >
                    📊 Analizar Stock (Demo)
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe tu pregunta..."
                    disabled={isLoading}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        fontSize: '14px',
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                    }}
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}
