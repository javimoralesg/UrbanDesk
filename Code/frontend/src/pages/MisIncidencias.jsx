import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import MapLocate from "../components/MapLocate";
import "../assets/css/MisIncidencias.css";

export default function MisIncidencias() {
  return (
    <>
      <Hero />
      <main className="mis-incidencias__layout">
        <Sidebar />
        <div className="mis-incidencias__content">
          <h2 className="mis-incidencias__title">
            Mis incidencias
          </h2>

          <p className="mis-incidencias__subtitle">
            Consulta toda la información relacionada con tus incidencias urbanas
          </p>

          <MapLocate width="100%" />
        </div>
      </main>
    </>
  );
}