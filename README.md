# BerryBot

Sistema web universitario para estudiantes de Ingeniería en Software de la Universidad Estatal de Sonora (UES Hermosillo).

---

## Descripción

BerryBot es una plataforma web diseñada para ayudar a los estudiantes a gestionar su información académica de manera sencilla y moderna. Incluye un sistema completo de autenticación, dashboard personalizado con vista de eventos y reseñas, modo oscuro, y está preparada para integrar un chatbot inteligente en futuras versiones.

El sistema permite a los estudiantes:
- Iniciar sesión con correo electrónico o con su cuenta de Google
- Completar su perfil universitario (nombre, apellidos, número de expediente)
- Visualizar eventos académicos próximos
- Ver reseñas de docentes publicadas por otros estudiantes
- Alternar entre tema claro y oscuro
- Cerrar sesión de manera segura

---

## Funcionalidades actuales

### Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- **Inicio de sesión con Google OAuth** (ventana de selección de cuenta Gmail)
- Verificación de perfil completo al iniciar sesión:
  - Usuarios nuevos → formulario de completado de perfil
  - Usuarios existentes con perfil completo → Dashboard directo

### Dashboard
- Bienvenida personalizada con el nombre del estudiante
- Vista de próximos eventos académicos
- Últimas reseñas de docentes
- Acceso rápido al chatbot BerryBot (en desarrollo)
- Barra de búsqueda para maestros y materias

### Modo Oscuro / Claro
- Toggle entre tema claro y oscuro
- Persistencia de preferencia en `localStorage`
- Transiciones suaves entre temas
- Iconos y textos adaptados para ambos modos

### Gestión de sesión
- Cierre de sesión con feedback visual (spinner)
- Limpieza automática de datos de sesión
- Redirección segura al login

---

## Tecnologías utilizadas

| Categoría | Tecnologías |
|-----------|--------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla), Tailwind CSS v3, Lexend (tipografía) |
| **Backend / DB** | Supabase (Autenticación + PostgreSQL) |
| **Autenticación** | Email/Password, Google OAuth |
| **Iconografía** | Material Symbols (Google Fonts) |
| **Herramientas** | Node.js + npm, PostCSS, Tailwind CLI |

---

## Estructura del proyecto

BerryBot/
├── public/
│ ├── login.html # Página de inicio de sesión
│ ├── complete-profile.html # Completado de perfil universitario
│ ├── dashboard.html # Panel principal del estudiante
│ ├── css/
│ │ └── styles.css # Estilos personalizados (dark mode, tabs)
│ ├── js/
│ │ ├── script.js # Código global (tema, tabs)
│ │ ├── controllers/
│ │ │ ├── authController.js # Login, registro, Google OAuth
│ │ │ ├── completeProfileController.js # Guardado de perfil
│ │ │ └── dashboardController.js # Dashboard y logout
│ │ └── models/
│ │ └── supabaseClient.js # Cliente de Supabase
│ └── dist/
│ └── output.css # TailwindCSS compilado
├── src/
│ └── input.css # Entrada de Tailwind
├── index.html # Redirección a login
├── tailwind.config.js
├── postcss.config.js
└── package.json

---

## Esquema de Base de Datos (Supabase)

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Perfiles extendidos de estudiantes (nombre, apellidos, expediente, rol) |
| `docentes` | Catálogo de docentes |
| `materias` | Retícula de materias de Ingeniería de Software |
| `docente_materia` | Relación N:M entre docentes y materias |
| `resenas` | Reseñas anónimas de docentes (estrellas, comentarios, tags) |
| `resenas_publicas` | Vista segura sin exponer datos del estudiante |
| `eventos` | Eventos académicos y culturales |
| `calendario` | Fechas clave del calendario escolar |
| `tutores` | Asignación de tutores por rango de expediente |
| `pasa_alumnos` | Alumnos del programa PASA que ofrecen asesorías |
| `servicios` | Servicios disponibles para alumnos |

### Seguridad (RLS)
- Row Level Security habilitado en todas las tablas
- Los estudiantes solo pueden ver y editar su propio perfil
- Las reseñas son anónimas (no se expone `usuario_id`)

---

## Instalación y configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/NotDrawing/BerryBot.git
cd BerryBot
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Compilar TailwindCSS
# Desarrollo (con watch)
```bash
npm run dev
```
# Produccion
```bash
npm run build
```

### 4. Configurar Supabase
1. Crear un proyecto en Supabase

2. Ejecutar el script SQL (incluido en el repositorio) para crear las tablas y políticas RLS

3. Configurar autenticación:
  - Habilitar Email/Password
  - Habilitar Google OAuth con Client ID y Client Secret

4. Configurar URLs de redirección:
  - https://notdrawing.github.io/BerryBot/**
  - http://127.0.0.1:5500/**

### 5. Configurar variables de entorno

En public/js/models/supabaseClient.js:

const SUPABASE_URL = 'tu-url-de-supabase'
const SUPABASE_KEY = 'tu-clave-anonima-de-supabase'

## Despliegue

**GitHub Pages**
El proyecto está configurado para desplegarse automáticamente en:

https://notdrawing.github.io/BerryBot/

**Desarrollo local**
```bash```
# Usar Live Server o cualquier servidor local
# Ejemplo con VS Code Live Server:
# Abrir con puerto 5500: http://127.0.0.1:5500/public/login.html

### Próximas funcionalidades

- Chatbot BerryBot con respuestas automáticas

- Búsqueda avanzada de maestros y materias

- Sistema de reseñas con calificación de estrellas

- Visualización de tutor asignado

- Calendario interactivo de eventos

- Módulo de asesorías PASA

- Notificaciones push

### Autores
- Proyecto de diseño web - Sistema Universitario con Chatbot
- Universidad Estatal de Sonora (UES) - Campus Hermosillo



