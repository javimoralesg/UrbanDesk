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
