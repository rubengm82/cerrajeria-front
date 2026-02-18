# Cerrajeria ABP - Frontend

Aplicación frontend para el proyecto de cerrajería (<a href="https://www.serralleriasolidaria.cat/" target="_blank">https://www.serralleriasolidaria.cat/</a>) desarrollado como trabajo académico ABP (Aprendizaje Basado en Proyectos).

## Autores

- **Alejandro Buenaventura Tarrillo**
- **Ruben Gallardo Mancha**

## Tecnologías Utilizadas

- **React 19** - Biblioteca de JavaScript para construir interfaces de usuario
- **Vite 7** - Herramienta de construcción rápida
- **Tailwind CSS 4** - Framework de CSS utilitario
- **DaisyUI 5** - Componentes de interfaz de usuario para Tailwind
- **Axios** - Cliente HTTP para realizar peticiones a la API
- **React Router DOM 7** - Librería de enrutamiento para React
- **ESLint** - Herramienta de linting para identificar patrones problemáticos en JavaScript

## Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn

## Clonar el Proyecto

```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# Entrar al directorio del proyecto
cd cerrajeria-front

# Instalar dependencias
npm install
```

## Ejecutar el Proyecto

### Modo Desarrollo

```bash
npm run dev
```

Esto iniciara el servidor de desarrollo en http://localhost:5173

### Modo Producción

```bash
# Construir la aplicación
npm run build

# Previsualizar la versión de producción
npm run preview
```

## Configuración

La aplicación está configurada para comunicarse con una API backend en http://localhost:8000. Esta configuración está definida en el archivo [`vite.config.js`](vite.config.js) mediante un proxy.

## Estructura del Proyecto

```
cerrajeria-front/
├── public/                  # Archivos públicos estáticos
├── src/
│   ├── api/                 # Peticiones a la API
│   ├── assets/              # Recursos estáticos
│   ├── components/         # Componentes reutilizables
│   ├── context/            # Contextos de React (Auth)
│   ├── pages/              # Páginas de la aplicación
│   ├── App.jsx             # Componente principal
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── eslint.config.js        # Configuración de ESLint
├── index.html              # Plantilla HTML
├── package.json            # Dependencias del proyecto
├── vite.config.js          # Configuración de Vite
└── README.md               # Este archivo
```

## Características

- Sistema de autenticación de usuarios
- Protección de rutas mediante autenticación
- Interfaz responsiva con Tailwind CSS y DaisyUI
- Comunicación con API REST mediante Axios
