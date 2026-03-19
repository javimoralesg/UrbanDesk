import { Route, Routes } from 'react-router'
import './App.css'

import Home from './pages/Home'
import RegistrarIncidencia from './pages/RegistrarIncidencia'
import ConsultarIncidencias from './pages/ConsultarIncidencias'
import IncidenciasUrbanas from './pages/IncidenciasUrbanas';
import IniciarSesion from "./pages/IniciarSesion";
import Registrarse from "./pages/Registrarse";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/incidencias-urbanas" element={<IncidenciasUrbanas />} />
        <Route path="/incidencias-urbanas/registrar-incidencia" element={<RegistrarIncidencia />} />
        <Route path="/incidencias-urbanas/consultar-incidencias" element={<ConsultarIncidencias />} />
        <Route path="/incidencias-urbanas/login" element={<IniciarSesion />} />
        <Route path="/incidencias-urbanas/register" element={<Registrarse />} />
        {/* <Route path="*" element={<NoMatch />} /> */}
      </Routes>
    </>
  )
}

export default App
