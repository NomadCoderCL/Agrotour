# Agrotour

**Repositorio:** [NomadCoderCL/Agrotour](https://github.com/NomadCoderCL/Agrotour)

---

## Descripción General

Agrotour es una plataforma orientada a la promoción y gestión del turismo rural y agroturismo, facilitando la conexión entre turistas y emprendimientos agrícolas. Este proyecto busca digitalizar la oferta turística rural, proporcionando herramientas tanto para usuarios (turistas) como para administradores y propietarios de emprendimientos.

---

## Tabla de Contenidos

- [Características principales](#características-principales)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Comandos Útiles](#comandos-útiles)
- [Guía de Contribución](#guía-de-contribución)
- [Licencia](#licencia)

---

## Características principales

- Registro y autenticación de usuarios.
- Panel de control para administradores y propietarios.
- Catálogo de experiencias y servicios rurales.
- Búsqueda y filtrado de actividades.
- Integración de mapas interactivos para geolocalización de emprendimientos.
- Sistema de reservas y contacto directo.
- Estadísticas y reportes para administradores.
- Interfaz moderna y responsiva.

---

## Arquitectura del Proyecto

El proyecto está dividido en _frontend_ y _backend_:

- **Frontend** (`frontend2`): Aplicación web basada en React, utilizando TypeScript y TailwindCSS para una experiencia de usuario moderna, rápida y móvil.
- **Backend** (`backend`): API desarrollada en Python, probablemente con Django, que expone los servicios necesarios para la gestión de usuarios, experiencias y reservas.

---

## Tecnologías Utilizadas

### Frontend

- **React** 18+
- **TypeScript**
- **TailwindCSS**
- **Radix UI** (componentes accesibles)
- **React Router DOM**
- **Leaflet** y **React-Leaflet** (mapas)
- **Socket.io-client** (comunicación en tiempo real)
- **Styled Components**
- **Recharts** (gráficos)
- **Axios** (peticiones HTTP)

### Backend

- **Python** (posiblemente Django)
- **SQLite** (base de datos por defecto)
- **Estructura modular por aplicaciones**

---

## Instalación y Puesta en Marcha

### Prerrequisitos

- Node.js >= 18
- Python >= 3.9
- Yarn o NPM
- pipenv/venv recomendado para backend

### Clonar el Repositorio

```bash
git clone https://github.com/NomadCoderCL/Agrotour.git
cd Agrotour
```

### Frontend

```bash
cd frontend2
npm install      # o yarn
npm run start    # o yarn start
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # si existe
python manage.py migrate
python manage.py runserver
```

---

## Estructura de Carpetas

```
Agrotour/
│
├── backend/
│   ├── agrotour_backend/    # Lógica principal del backend
│   ├── aplicacion/          # Aplicaciones específicas del proyecto
│   ├── db.sqlite3           # Base de datos local
│   └── manage.py            # Script de gestión Django
│
├── frontend2/
│   ├── src/                 # Código fuente de React
│   ├── public/              # Archivos públicos y estáticos
│   ├── package.json         # Configuración y dependencias
│   ├── tailwind.config.js   # Configuración TailwindCSS
│   └── .env                 # Variables de entorno
│
├── package.json             # Configuración global del monorepo (si aplica)
└── package-lock.json        # Bloqueo de dependencias
```

---

## Comandos Útiles

### Frontend

- `npm run start` - Inicia la app en modo desarrollo.
- `npm run build` - Construye la app para producción.
- `npm run test`  - Ejecuta pruebas.

### Backend (Django)

- `python manage.py runserver` - Inicia el servidor local.
- `python manage.py migrate`   - Aplica migraciones a la base de datos.
- `python manage.py createsuperuser` - Crea un usuario administrador.

---

## Guía de Contribución

1. Haz un fork del proyecto.
2. Crea un branch (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit.
4. Haz push a tu fork y abre un Pull Request.
5. Describe claramente tu contribución.

---

## Licencia

Actualmente este proyecto **no tiene licencia definida**. Contacta al autor para consultas sobre uso y distribución.

---

## Autor

[NomadCoderCL](https://github.com/NomadCoderCL)

---

_¿Preguntas o sugerencias? ¡Abre una issue o contáctanos!_
