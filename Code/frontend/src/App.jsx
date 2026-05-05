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
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import IncidenciasPublicas from "./pages/IncidenciasPublicas";
import GenerarInforme from './pages/GenerarInforme';
import BuscarIncidenciasCercanas from './pages/BuscarIncidenciasCercanas';


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
        <Route path="/incidencias-urbanas/mis-incidencias" element={<MisIncidencias />} />
        <Route path="/incidencias-urbanas/editar-perfil" element={<EditarPerfil />} />
        <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/incidencias-urbanas/editar/:id" element={<RegistrarIncidencia />} />
        <Route path="/incidencias-urbanas/incidencias-publicas" element={<IncidenciasPublicas />} />
        <Route path="/incidencias-urbanas/generar-informe" element={<GenerarInforme />} />
        <Route path="/incidencias-urbanas/buscar-incidencias-cercanas" element={<BuscarIncidenciasCercanas />} />
        <Route path="/incidencias-urbanas/buscar-incidencias-cercanas/:id" element={<DetalleIncidencia />} />
        <Route path="*" element={<NoMatch />} />

      </Routes>
    </>
  )
}

export default App
