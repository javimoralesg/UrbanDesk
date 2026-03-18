import HomeCards from "./HomeCards";

export default function HomeContent() {
  return (
    <section className="urban-home__content">
      <h2 id="portada" className="urban-home__title">
        Portada
      </h2>

      <p className="urban-home__subtitle">
        Consulta toda la información relacionada con incidencias urbanas
      </p>

      <HomeCards />

    </section>
  );
}