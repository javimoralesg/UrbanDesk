import { Link } from "react-router";
import "../css/Sidebar.css";

export default function Sidebar({ active = "portada" }) {
  return (
    <aside className="urban-home__sidebar">
      <div className="urban-home__sidebar-title">Portada</div>

      <nav className="urban-home__nav">
        <Link
          to="/"
          className={`urban-home__nav-item ${active === "portada" ? "urban-home__nav-item--active" : ""}`}
        >
          Portada
        </Link>

        <Link
          to="/register"
          className={`urban-home__nav-item ${active === "registro" ? "urban-home__nav-item--active" : ""}`}
        >
          Registrarse
        </Link>

        <Link
          to="/login"
          className={`urban-home__nav-item ${active === "login" ? "urban-home__nav-item--active" : ""}`}
        >
          Iniciar sesión
        </Link>

        <Link
          to="/registrar-incidencia"
          className={`urban-home__nav-item ${active === "incidencia" ? "urban-home__nav-item--active" : ""}`}
        >
          Registrar incidencia
        </Link>
      </nav>
    </aside>
  );
}