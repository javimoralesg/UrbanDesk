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
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="/incidencias-urbanas" element={<IncidenciasUrbanas />} /> */}
        <Route path="/" element={<IncidenciasUrbanas />} />
        <Route path="/registrar-incidencia" element={<RegistrarIncidencia />} />
        <Route path="/consultar-incidencias" element={<ConsultarIncidencias />} />
        <Route path="/login" element={<IniciarSesion />} />
        <Route path="/register" element={<Registrarse />} />
        {/* <Route path="*" element={<NoMatch />} /> */}
      </Routes>
    </>
  )
}

export default App
