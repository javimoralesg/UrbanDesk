import { Link } from 'react-router';

export default function HomeCards() {
  return (
    <section className="urban-home__cards">
      <Link to="/register" className="urban-home__action-card">
        <span>Registrarse</span>
      </Link>

      <Link to="/login" className="urban-home__action-card">
        <span>Iniciar sesión</span>
      </Link>

      <Link
        to="/incidencias-urbanas/registrar-incidencia"
        className="urban-home__action-card urban-home__action-card--wide"
      >
        <span>Registrar incidencia</span>
      </Link>
    </section>
  );
}