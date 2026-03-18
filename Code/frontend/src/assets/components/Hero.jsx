import "../css/Hero.css";

export default function Hero() {
  return (
    <header className="urban-home__hero">
      <div className="urban-home__hero-overlay">
        <div className="urban-home__hero-topbar">
          <span className="urban-home__brand">UrbanDesk</span>
        </div>

        <div className="urban-home__breadcrumb">
          <span className="urban-home__breadcrumb-home">⌂</span>
          <span>Incidencias Urbanas</span>
        </div>

        <div className="urban-home__hero-content">
          <p className="urban-home__section-label">
            Portal de incidencias
          </p>
          <h1>INCIDENCIAS URBANAS</h1>
        </div>
      </div>
    </header>
  );
}