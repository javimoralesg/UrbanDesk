import Hero from "../assets/components/Hero";
import Sidebar from "../assets/components/Sidebar";
import Cards from "../assets/components/Cards";
import "../assets/css/IncidenciasUrbanas.css";

export default function IncidenciasUrbanas() {
  return (
    <>
      <Hero />

      <main className="urban-home__layout">
        <Sidebar />

        <div className="urban-home__content-wrapper">
          <section className="urban-home__content">
            <h2 className="urban-home__title">
              Portada
            </h2>

            <p className="urban-home__subtitle">
              Consulta toda la información relacionada con incidencias urbanas
            </p>

            <Cards />
          </section>
        </div>
      </main>
    </>
  );
}