# React + Vite

## Cómo arrancar el proyecto

Para arrancar el frontend de la aplicación, sigue los siguientes pasos:

1.  Abre una terminal y navega hasta la carpeta del frontend:
    ```bash
    cd Code/frontend
    ```

2.  Instala las dependencias del proyecto:
    ```bash
    npm install
    ```

3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

4.  Abre tu navegador y accede a la URL que aparece en la terminal (generalmente http://localhost:5173).

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Documentación de Componentes de Mapa

A continuación se describe brevemente el funcionamiento de los componentes y páginas principales relacionados con la gestión de mapas:

### 1. MapLocate.jsx
Componente encargado de **visualizar incidencias** en el mapa.
- **Librería:** Utiliza `react-leaflet` para renderizar el mapa y los marcadores.
- **Props:** Recibe una lista de `puntos` (coordenadas e información de la incidencia).
- **Funcionalidades:**
  - **AutoZoom:** Ajusta automáticamente la vista del mapa para encuadrar todos los marcadores visibles.
  - **Navegación:** Al hacer clic en un marcador, redirige a la vista detallada de la incidencia (`/punto/:id`).
  - **Marcadores:** Usa iconos de colores diferenciados para representar las ubicaciones.

### 2. MapRegister.jsx
Componente reutilizable y hook personalizado para **seleccionar la ubicación** de una nueva incidencia.
- **Hook `useMapRegisterLogic`:** Gestiona el estado de la dirección, sugerencias de autocompletado (vía API de OpenStreetMap/Nominatim), y la ubicación objetivo.
- **Funcionalidades:**
  - **Geocoding Inverso:** Traduce coordenadas (lat, lng) a una dirección legible cuando se mueve el mapa.
  - **Control de Centro:** Mantiene un marcador fijo en el centro mientras el usuario desplaza el mapa para afinar la ubicación.
  - **Búsqueda:** Permite buscar direcciones y mover el mapa a la ubicación seleccionada.

### 3. RegistrarIncidencia.jsx
Página principal para el **registro de nuevas incidencias**.
- Integra la lógica de `MapRegister`.
- Proporciona una interfaz de usuario con:
  - **Barra de búsqueda:** Con autocompletado para encontrar direcciones rápidamente.
  - **Botón "Ubicación actual":** Utiliza la API de geolocalización del navegador para centrar el mapa en la posición del usuario.
  - **Mapa interactivo:** Para confirmar la ubicación exacta de la incidencia.

### 4. ConsultarIncidencias.jsx
Página destinada a la **consulta y visualización** general de incidencias.
- Actúa como un contenedor para el componente `MapLocate`.
- Define las dimensiones del mapa y orquesta la visualización de los datos de incidencias disponibles.
