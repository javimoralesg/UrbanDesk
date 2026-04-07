# UrbanDesk

Bienvenido a **UrbanDesk**, el Producto Mínimo Viable (MVP) para la Gestión de Incidencias Urbanas (Grupo 8). Esta aplicación permite a los usuarios reportar, visualizar y gestionar incidencias que ocurren en el entorno urbano de forma sencilla e intuitiva.

El proyecto completo se divide principalmente en dos partes: el **Frontend** (interfaz de usuario) y el **Backend** (servidor y lógica de negocio). Todo el código fuente del aplicativo se encuentra dentro de la carpeta `Code/`.

---

## Estructura del Proyecto (`Code/`)

La carpeta `Code` engloba el proyecto íntegro. A continuación, se detalla la arquitectura, tecnologías y el propósito de cada módulo.

### 1. `Code/frontend` (Cliente Web UI)

Esta carpeta contiene una Single Page Application (SPA) construida con **React (v19)** y gestionada por **Vite** para ofrecer un entorno de desarrollo rápido y moderno.

**Tecnologías y Librerías Principales:**

- **`react-router`**: Para la navegación entre diferentes vistas o páginas.
- **`leaflet` & `react-leaflet`**: Para la visualización e interacción con el mapa del entorno urbano al localizar incidencias.
- **`react-media-recorder`**: Utilizado para permitir grabaciones de medios adjuntos a ciertas incidencias.
- **`eslint`**: Analizador de código estático según las reglas en `eslint.config.js`.

**Estructura Interna del Frontend:**

- **`public/`**: Directorio de archivos estáticos que se sirven directamente sin ser procesados por Vite. Incluye, por ejemplo, la carpeta `websAyto/` con HTMLs estáticos (`Mayor.html`, `Mediano.html`, `Pequeño.html`) relacionados con información o integraciones del Ayuntamiento.
- **`src/components/`**: Componentes reutilizables. Destacan los relacionados con el mapa (`MapLocate.jsx`, `MapRegister.jsx`), el reproductor y grabación media (`MediaPopup.jsx`, `Recording.jsx`) y elementos base de la interfaz (`Sidebar.jsx`, `Hero.jsx`).
- **`src/pages/`**: Agrupa las pantallas principales conectadas al enrutador. Incluye inicio de sesión/registro (`IniciarSesion.jsx`, `Registrarse.jsx`), flujos de incidencias (`IncidenciasUrbanas.jsx`, `MisIncidencias.jsx`, `DetalleIncidencia.jsx`, `RegistrarIncidencia.jsx`) y el Home (`Home.jsx`).
- **`src/services/`**: Contiene `api.js`, servicio centralizado para la comunicación HTTP con el Backend y Servicios de IA.
- **`src/assets/`**: Archivos estáticos con los estilos (`css/`) que dan formato a lo largo de toda la aplicación, además de recursos geográficos (`geo/`).

---

### 2. `Code/backend` (Servidor API REST)

Esta carpeta contiene la API REST desarrollada en **Java 17** utilizando el robusto framework **Spring Boot (v3.5)**. Se encarga de la gestión de la base de datos, seguridad, usuarios y correos electrónicos.

**Tecnologías, Librerías y Patrones Principales:**

- **Spring Boot Web & Data JPA**: Construcción de la API y modelo relacional de datos manejado por Hibernate.
- **Spring Security**: Para securizar los accesos a los endpoints (control de rutas protegidas).
- **Spring Mail**: Empleado para el envío de notificaciones automáticas/correos.
- **Bases de Datos**: Se usa una base de datos en memoria **H2** para desarrollo por defecto (accesible vía consola `/h2-console`), pero está preparado para usar **PostgreSQL** en producción (mediante `dotenv-java`).
- **Lombok**: Para reducir el código *boilerplate* en las entidades.
- **Springdoc OpenAPI (Swagger)**: Exposición de la documentación interactiva de la API.

**Estructura Interna del Backend (`src/main/java/urbandesk/backend/`):**
Sigue una arquitectura en capas tradicional (Layered Architecture):

- **`domain/` (Modelo/Entidades)**: Estructura de clases o entidades mapeadas a las tablas de la base de datos.
- **`repository/`**: Interfaces de Spring Data conectadas a la base de datos para ejecutar el CRUD de cada entidad.
- **`service/`**: Contiene toda la lógica de negocio (validaciones, cálculos). Actúa de capa intermedia entre Controladores y Repositorios.
- **`controller/`**: Los endpoints REST, reciben la petición HTTP, llaman a un servicio y devuelven las respuestas.
- **`config/`**: Archivos de configuración (Swagger, filtros de Seguridad, etc.).

Adicionalmente, en `src/main/resources/application.properties` se declaran las configuraciones por entornos (conexión a H2, puertos, credenciales SMTP, etc.).

---

## Cómo arrancar el proyecto

Para poder ejecutar la aplicación completa en tu máquina local, deberás arrancar tanto el servidor Backend como el cliente Frontend.

### 1. Arrancar el Backend (Servidor)

El backend expone una API REST para gestionar la información de la aplicación (usuarios e incidencias).

#### Requisitos Previos

Es necesario tener instalado **Java 17**. Puedes descargar la versión recomendada (`OpenJDK 17.0.18`) desde aquí:
[Descargar Java 17 - Microsoft](https://learn.microsoft.com/es-es/java/openjdk/download)

*(Opcional) La imagen `SpringDependencies.png` en la raíz muestra un extracto rápido de Spring Initializr con los módulos usados.*

#### Pasos de ejecución

1. Abre una terminal en el directorio raíz del proyecto (`UrbanDesk`).
2. Navega a la carpeta del backend:

   ```bash
   cd Code/backend
   ```
3. Ejecuta el servidor de Spring Boot usando Maven Wrapper:

   **En Windows:**

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

   **En Linux/Mac:**

   ```bash
   ./mvnw spring-boot:run
   ```

El servidor arrancará y por defecto estará escuchando en el puerto **8080**.
La consola de base de datos H2 se podrá observar en `http://localhost:8080/h2-console`.

### 2. Arrancar el Frontend (Cliente)

Asegúrate de tener **Node.js** (y NPM) instalados en tu sistema.

#### Pasos de ejecución

1. Abre **otra terminal** en el directorio raíz del proyecto (la anterior debe seguir ejecutando el backend).
2. Navega a la carpeta del frontend:
   ```bash
   cd Code/frontend
   ```
3. Instala todas las dependencias necesarias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
5. Una vez arrancado, abre tu navegador y visita la URL que se muestra en la terminal (usualmente `http://localhost:5173`). ¡Y listo! La aplicación debería estar funcionando y conectándose correctamente al backend.
