import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from '../components/MapLocate';
import "../assets/css/ConsultarIncidencias.css"; 

export default function ConsultarIncidencias() {
  return (
    <>
      <Hero />
      <main className="consultar-incidencias__layout">
        <Sidebar />
        <div className="consultar-incidencias__content">
            <h2 className="consultar-incidencias__title">
            Consultar Incidencias
          </h2>

          <p className="consultar-incidencias__subtitle">
            Consulta toda la información relacionada con incidencias urbanas
          </p>
            <MapLocate width="100%" /> 
        </div>
      </main>
    </>
  );
}
