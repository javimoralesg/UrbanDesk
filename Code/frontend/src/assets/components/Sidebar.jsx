import { Link } from "react-router";
import '../css/Sidebar.css';

export default function Sidebar({ active = "portada" }) {
  return (
    <aside className="urban-sidebar__sidebar">
      <div className="urban-sidebar__sidebar-title">Portada</div>

      <nav className="urban-sidebar__nav">
        <Link
          to="/"
          className={`urban-sidebar__nav-item ${active === "portada" ? "urban-sidebar__nav-item--active" : ""}`}
        >
          Portada
        </Link>

        <Link
          to="/register"
          className={`urban-sidebar__nav-item ${active === "registro" ? "urban-sidebar__nav-item--active" : ""}`}
        >
          Registrarse
        </Link>

        <Link
          to="/login"
          className={`urban-sidebar__nav-item ${active === "login" ? "urban-sidebar__nav-item--active" : ""}`}
        >
          Iniciar sesión
        </Link>

        <Link
          to="/registrar-incidencia"
          className={`urban-sidebar__nav-item ${active === "incidencia" ? "urban-sidebar__nav-item--active" : ""}`}
        >
          Registrar incidencia
        </Link>
      </nav>
    </aside>
  );
}