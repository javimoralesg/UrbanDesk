import { Route, Routes } from 'react-router'
import './App.css'

import Home from './pages/Home'
import RegistrarIncidencia from './pages/RegistrarIncidencia'
import IncidenciasUrbanas from './pages/IncidenciasUrbanas';
import IniciarSesion from "./pages/IniciarSesion";
import Registrarse from "./pages/Registrarse";
import NoMatch from "./pages/NoMatch";
import MisIncidencias from './pages/MisIncidencias';
import DetalleIncidencia from './pages/DetalleIncidencia';
import EditarPerfil from './pages/EditarPerfil';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/incidencias-urbanas" element={<IncidenciasUrbanas />} />
        <Route path="/incidencias-urbanas/registrar-incidencia" element={<RegistrarIncidencia />} />
        <Route path="/incidencias-urbanas/mis-incidencias/:id" element={<DetalleIncidencia />} />
        <Route path="/incidencias-urbanas/login" element={<IniciarSesion />} />
        <Route path="/incidencias-urbanas/register" element={<Registrarse />} />
        <Route path="*" element={<NoMatch />} />
        <Route path="/incidencias-urbanas/mis-incidencias" element={<MisIncidencias />} />
        <Route path="/incidencias-urbanas/editar-perfil" element={<EditarPerfil />} />
      </Routes>
    </>
  )
}

export default App
