# 🌿 Agrotour - Plataforma de Agroturismo Offline-First

[![Django](https://img.shields.io/badge/Backend-Django%205.2-092E20?logo=django)](https://www.djangoproject.com/)
[![FastAPI](https://img.shields.io/badge/Sync-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL%20RLS-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)

Agrotour es una ecosistema digital diseñado para revitalizar el turismo rural, permitiendo a los productores locales gestionar sus emprendimientos con tecnología de vanguardia, incluso en zonas con conectividad limitada. 

---

## 🚀 Características Principales (Fase 1)

### 🛡️ Multi-Tenancy Estricto (RLS)
Arquitectura de aislamiento de datos nivel Enterprise. Utilizamos **Row-Level Security (RLS)** nativo de PostgreSQL para asegurar que cada productor solo acceda a su propia información, garantizando privacidad y seguridad total.

### 🔄 Sync Engine Offline-First
Motor de sincronización híbrido desarrollado con **FastAPI**. Permite registrar ventas e inventario sin conexión a internet, sincronizando automáticamente los datos cuando se recupera la señal, utilizando un algoritmo inteligente de resolución de conflictos.

### 🔔 Notificaciones Real-Time
Comunicación bidireccional mediante **WebSockets (Django Channels + Redis)**. Alertas instantáneas para pedidos, stock bajo y actualizaciones del sistema.

### 📸 Optimización de Medios
Sistema de carga de imágenes con **compresión inteligente (Pillow)**. Las fotos se optimizan automáticamente a <200KB para asegurar un rendimiento óptimo en redes móviles rurales.

### 🔐 Autenticación Universal
Acceso seguro mediante **JWT** e integración con **OAuth2 (Google y Facebook)** para una experiencia de usuario fluida.

### 🌿 Sostenibilidad e IA
*   **Huella de Carbono:** Cálculo automático de kg de CO2 "ahorrados" por cada venta local.
*   **Gestión de Cupones:** Sistema dinámico de descuentos (Fijo/Porcentaje).
*   **Tareas Asíncronas:** Workers de **Celery** para procesos pesados y recordatorios automáticos.

---

## 🛠️ Stack Tecnológico

### Backend Core
- **Django 5.2.1** (Business Logic & Admin)
- **FastAPI** (High-Performance Sync Engine)
- **Celery & Redis** (Task Queue & Caching)
- **Django Channels** (WebSockets)
- **Python-Pillow** (Image Processing)

### Frontend Core
- **React 18** + **TypeScript**
- **Tailwind CSS** + **Radix UI**
- **Dexie.js** (IndexedDB para almacenamiento offline)
- **Playwright** (E2E Testing)

---

## 📂 Estructura del Proyecto

```bash
Agrotour/
├── backend/            # API Core (Django)
│   ├── agrotour_backend/ # Configuración y Celery
│   └── aplicacion/      # Modelos, Vistas y Lógica de Negocio
├── backend-sync/       # Motor de Sincronización (FastAPI)
├── frontend2/          # Aplicación Web (React)
└── README.md           # Documentación Principal
```

---

## ⚙️ Instalación Rápida

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/NomadCoderCL/Agrotour.git
   ```

2. **Backend (Django):**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Backend Sync (FastAPI):**
   ```bash
   cd backend-sync
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8001
   ```

4. **Frontend (React):**
   ```bash
   cd frontend2
   npm install
   npm run start
   ```

---

## 👥 Autor
Desarrollado con ❤️ por **NomadCoderCL**. 
Para consultas sobre el proyecto, visita mi perfil en [GitHub](https://github.com/NomadCoderCL).

---
_Agrotour: Empoderando al agro con tecnología de clase mundial._
