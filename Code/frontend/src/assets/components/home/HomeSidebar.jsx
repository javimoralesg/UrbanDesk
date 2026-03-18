export default function HomeSidebar() {
  return (
    <aside className="urban-home__sidebar">
      <div className="urban-home__sidebar-title">
        Portada
      </div>

      <nav className="urban-home__nav">
        <a href="#portada" className="urban-home__nav-item urban-home__nav-item--active">
          Portada
        </a>

        <a href="#registro" className="urban-home__nav-item">
          Registrarse
        </a>

        <a href="#login" className="urban-home__nav-item">
          Iniciar sesión
        </a>

        <a href="#incidencia" className="urban-home__nav-item">
          Registrar incidencia
        </a>
      </nav>
    </aside>
  );
}