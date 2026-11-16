# Luz del Sur: Sistema inteligente de incidencias eléctricas

> Plataforma web para la gestión y priorización de incidencias eléctricas. Frontend desarrollado con React, TypeScript y Tailwind CSS.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss\&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP_Client-5A29E4?logo=axios\&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Data_Visualization-22B5BF)
![Vite](https://img.shields.io/badge/Vite-Frontend_Tool-646CFF?logo=vite\&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel\&logoColor=white)

## 📌 Sobre el proyecto

Este proyecto propone una plataforma web que **consolida múltiples reportes de una misma falla eléctrica en una sola incidencia**, con revisión humana (*human-in-the-loop*) antes de desplegar a los técnicos de campo.

Este repositorio contiene el **frontend** del proyecto académico del curso *Innovación y Transformación Digital* (UTP), desarrollado con una arquitectura basada en features. Incluye tres vistas según el rol del usuario: **cliente**, **operador** y **técnico**.

> ⚠️ Es un prototipo académico que trabaja con **datos simulados**. No está conectado a los sistemas reales de Luz del Sur.

### Ecosistema del proyecto

| Repositorio | Descripción |
| ----------- | ----------- |
| `LuzDelSur_Frontend` | Interfaz web (React + TypeScript) |
| `LuzDelSur_Backend` | API REST (Spring Boot) y motor de agrupación heurística |
| `LuzDelSur_Embeddings` | Microservicio de IA (Python) para similitud semántica entre reportes |

## ✨ Características

### 👤 Cliente
* 🔐 Registro e inicio de sesión
* ⚡ Reporte de incidencia eléctrica (sector, tipo de falla, descripción)
* 🆔 Identificador único (UUID) por reporte
* 🔎 Consulta del estado del reporte y su vínculo con una incidencia común
* 📜 Historial de reportes
* ⭐ Calificación de la atención o reporte de persistencia de la falla

### 🖥️ Operador
* 📊 Panel de monitoreo con métricas e incidencias activas
* 🧩 Bandeja de agrupaciones sugeridas: confirmar, separar o reasignar reportes
* ⚠️ Etiqueta visual de **"Baja Certeza"** para casos que requieren revisión explícita
* 🔗 Visualización de reportes originales (hijos) dentro de cada incidencia (padre)
* 🧑‍🔧 Asignación de reportes a técnicos disponibles
* 👥 Gestión de técnicos
* 🗂️ Historial de incidencias

### 🔧 Técnico de campo
* 📋 Tareas asignadas con contexto consolidado (ubicación, alcance y reportes vinculados)
* ✅ Registro de resolución de la incidencia
* 📁 Historial de tareas cumplidas

## 🛠️ Tecnologías

| Tecnología   | Uso                               |
| ------------ | --------------------------------- |
| React        | Interfaz de usuario               |
| TypeScript   | Tipado estático                   |
| Tailwind CSS | Estilos y diseño responsivo       |
| Axios        | Consumo de API REST               |
| React Router | Navegación y rutas por rol        |
| Recharts     | Gráficos del panel del operador   |
| Vite         | Desarrollo y build                |
| Lucide React | Iconografía                       |
| Vercel       | Despliegue del frontend           |

## 🏗️ Arquitectura

El proyecto utiliza una **arquitectura basada en features (Feature-Based Architecture)**. Cada funcionalidad agrupa sus propios componentes, páginas, servicios, hooks y tipos.

Las funcionalidades reutilizables se mantienen en `shared`. Las rutas están protegidas según el rol del usuario (cliente, operador o técnico).

```text
src/
├── app/                 # Configuración, rutas y guardas por rol
│
├── features/            # Funcionalidades del sistema
│   ├── auth/            # Login y registro
│   ├── client/          # Reportar incidencia, estado e historial
│   ├── operator/        # Panel, bandeja de agrupaciones, asignación
│   ├── technicians/     # Gestión de técnicos
│   ├── technician/      # Tareas asignadas e historial del técnico
│   └── incidents/       # Incidencias padre y reportes hijo (compartido)
│
├── shared/              # Elementos reutilizables
│   ├── components/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
│
├── assets/
├── main.tsx
└── index.css
```

### Flujo general del sistema

```text
Cliente ──reporta──▶ Backend ──consulta similitud──▶ Servicio de embeddings
                        │
                        ▼
                 Propuesta de agrupación
                        │
                        ▼
Operador ──confirma / separa / reasigna──▶ Técnico ──resuelve──▶ Cliente califica
```

## 🚀 Instalación

### Requisitos

* Node.js >= 18
* npm
* Git

### Clonar el repositorio

```bash
git clone https://github.com/[usuario]/luzdelsur-frontend.git
cd luzdelsur-frontend
```

### Instalar dependencias

```bash
npm install
```

### Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080/api
```

| Variable       | Descripción                          |
| -------------- | ------------------------------------ |
| `VITE_API_URL` | URL base de la API del backend       |

### Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en la URL indicada por Vite, normalmente:

```text
http://localhost:5173
```

### Generar build de producción

```bash
npm run build
```

## 🔌 API

El frontend utiliza **Axios** para la comunicación con el backend (`luzdelsur-backend`), que expone una API REST en Spring Boot.

La autenticación usa **JWT**: el interceptor de Axios envía `Authorization: Bearer <token>`. Ante un `401` intenta una vez `POST /v1/auth/refresh` y, si falla, cierra la sesión y vuelve al login. Al recargar la página la sesión se valida con `GET /v1/auth/me`.

Cuentas de demostración (las crea el backend al arrancar): `operador@luzdelsur.com.pe`, `tecnico@luzdelsur.com.pe`, `tecnico2@luzdelsur.com.pe` y `cliente@luzdelsur.com.pe`, con la contraseña `APP_DEMO_PASSWORD` del backend (`12345678` en local). El registro público crea solo cuentas de cliente.

Endpoints consumidos (base `VITE_API_URL`, que ya incluye `/api`):

| Vista | Método | Endpoint |
| ----- | ------ | -------- |
| Login / registro | POST | `/v1/auth/login`, `/v1/auth/register`, `/v1/auth/refresh` · GET `/v1/auth/me` |
| Cliente | POST | `/v1/reports` (alta) |
| Cliente | GET | `/v1/reports/mine` (mis reportes), `/v1/reports/{id}` (seguimiento) |
| Cliente | POST | `/v1/reports/{id}/persistence` (la falla persiste), `/v1/reports/{id}/feedback` (calificación) |
| Operador | GET | `/v1/operator/incidents`, `/v1/operator/incidents/{id}`, `/v1/operator/technicians` |
| Operador | POST | `/v1/operator/incidents/{id}/confirm`, `/status`, `/assign` · `/v1/operator/reports/{id}/separate`, `/reassign` |
| Técnico | GET | `/v1/technician/incidents`, `/v1/technician/incidents/{id}`, `/history`, `/{id}/timeline` |
| Técnico | POST | `/v1/technician/incidents/{id}/status` |

El contrato completo está en `docs/api.md` del repositorio del backend. La API también expone `/v1/operator/metrics` y `/v1/operator/audit-events`, que aún no tienen pantalla.

## ☁️ Despliegue

El frontend se despliega en **Vercel**.

* Demo: [URL de Vercel]
* Backend y servicios: desplegados en servidor propio con Docker (ver `luzdelsur-backend`).

## 👥 Equipo

Universidad Tecnológica del Perú, Facultad de Ingeniería de Sistemas e Informática. Curso: Innovación y Transformación Digital, sección 35099.

* Ojeda Arrelucea, Daniela Fernanda
* Maldonado Vasquez, Rodrigo
* Menor Silva, Kevin Ivan
* Sanchez Ciriaco, Anthony Max
* Huane Sarmiento, Carlos Jesús

## 📌 Estado del proyecto

**En desarrollo 🚧**

Prototipo académico con datos simulados. Actualmente se encuentran en implementación las vistas de cliente, operador y técnico, y su integración con el backend.
