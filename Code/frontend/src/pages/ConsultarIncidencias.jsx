import Hero from "../assets/components/Hero";
import Sidebar from "../assets/components/Sidebar";
import MapLocate from '../assets/components/MapLocate';
import "../assets/css/ConsultarIncidencias.css"; 

export default function ConsultarIncidencias() {
  return (
    <>
      <Hero />
      <main className="consultar-incidencias__layout">
        <Sidebar />
        <div className="consultar-incidencias__content">
            <h1>Consultar Incidencias</h1>
            <MapLocate width="100%" /> 
        </div>
      </main>
    </>
  );
}
