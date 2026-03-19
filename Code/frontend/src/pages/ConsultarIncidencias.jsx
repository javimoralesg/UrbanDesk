import Hero from "../assets/components/Hero";
import Sidebar from "../assets/components/Sidebar";
import MapLocate from '../assets/components/MapLocate';
import "../assets/css/RegistrarIncidencia.css"; 

export default function ConsultarIncidencias() {
  return (
    <>
      <Hero />
      <main className="registrar-incidencia__layout">
        <Sidebar className="registrar-incidencia__sidebar" />
        <div className="registrar-incidencia__content">
            <h1>Consultar Incidencias</h1>
            <MapLocate width="100%" /> 
        </div>
      </main>
    </>
  );
}
