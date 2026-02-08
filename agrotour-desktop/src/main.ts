import { invoke } from '@tauri-apps/api/core';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

let messages: Message[] = [];
let isLoading = false;

// DOM Elements
const messagesContainer = document.getElementById('messages-container')!;
const inputField = document.getElementById('message-input') as HTMLInputElement;
const sendButton = document.getElementById('send-button') as HTMLButtonElement;
const analyzeButton = document.getElementById('analyze-button') as HTMLButtonElement;

function renderMessages() {
  if (messages.length === 0) {
    messagesContainer.innerHTML = `
      <div style="color: #999; text-align: center; margin-top: 50px;">
        <p>Pregúntame sobre:</p>
        <ul style="list-style: none; padding: 0;">
          <li>📊 Análisis de stock</li>
          <li>💰 Recomendaciones de precios</li>
          <li>✍️ Generación de descripciones</li>
          <li>🌾 Consejos agrícolas</li>
        </ul>
      </div>
    `;
    return;
  }

  messagesContainer.innerHTML = messages
    .map(
      (msg) => `
      <div style="
        margin-bottom: 15px;
        padding: 12px;
        border-radius: 8px;
        background-color: ${msg.role === 'user' ? '#e3f2fd' : '#fff'};
        border: ${msg.role === 'assistant' ? '1px solid #e0e0e0' : 'none'};
      ">
        <strong>${msg.role === 'user' ? '👤 Tú' : '🤖 IA'}:</strong>
        <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${msg.content}</p>
      </div>
    `
    )
    .join('');

  if (isLoading) {
    messagesContainer.innerHTML += `
      <div style="text-align: center; color: #666;">
        <p>⏳ Pensando...</p>
      </div>
    `;
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
  const input = inputField.value.trim();
  if (!input || isLoading) return;

  messages.push({ role: 'user', content: input });
  inputField.value = '';
  isLoading = true;
  renderMessages();

  try {
    const response = await invoke<{ response: string; model: string }>('ai_chat', {
      prompt: input,
      context: null,
    });

    messages.push({ role: 'assistant', content: response.response });
  } catch (error) {
    messages.push({
      role: 'assistant',
      content: `Error: ${error}\n\nAsegúrate de que Ollama esté corriendo con:\nollama pull qwen2.5:3b-instruct\nollama serve`,
    });
  } finally {
    isLoading = false;
    renderMessages();
  }
}

async function analyzeStock() {
  if (isLoading) return;

  isLoading = true;
  renderMessages();

  try {
    const response = await invoke<string>('ai_analyze_stock', {
      productName: 'Tomates',
      salesData: '150 kg vendidos',
      currentStock: 50,
    });

    messages.push({ role: 'assistant', content: response });
  } catch (error) {
    messages.push({
      role: 'assistant',
      content: `Error en análisis: ${error}`,
    });
  } finally {
    isLoading = false;
    renderMessages();
  }
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);
analyzeButton.addEventListener('click', analyzeStock);
inputField.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Initial render
renderMessages();
