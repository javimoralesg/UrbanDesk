import { Link, useLocation } from "react-router";
import '../css/Sidebar.css';

const opcionesGlobales = {
    SinRegistro: [
        { text: "Portada", link: "/incidencias-urbanas" },
        { text: "Registrarse", link: "/incidencias-urbanas/register" },
        { text: "Iniciar sesión", link: "/incidencias-urbanas/login" },
        { text: "Registrar incidencia", link: "/incidencias-urbanas/registrar-incidencia" },
    ],
    Usuario: [
        { text: "Portada", link: "/incidencias-urbanas" },
        { text: "Cerrar sesión", link: "/incidencias-urbanas/logout" },
        { text: "Editar perfil", link: "/incidencias-urbanas/editar-perfil " },
        { text: "Consultar incidencias", link: "/incidencias-urbanas/consultar-incidencias" },
        { text: "Registrar incidencia", link: "/incidencias-urbanas/registrar-incidencia" },
    ],
    Operador: [
        { text: "Portada", link: "/incidencias-urbanas" },
        { text: "Cerrar sesión", link: "/incidencias-urbanas/logout" },
        { text: "Editar perfil", link: "/incidencias-urbanas/editar-perfil " },
        { text: "Consultar incidencias", link: "/incidencias-urbanas/consultar-incidencias" },
        { text: "Buscar incidencias cercanas", link: "/incidencias-urbanas/buscar-incidencias-cercanas" },
        { text: "Generar informe", link: "/incidencias-urbanas/generar-informe" },
    ],
    Tecnico: [
        { text: "Portada", link: "/incidencias-urbanas" },
        { text: "Cerrar sesión", link: "/incidencias-urbanas/logout" },
        { text: "Editar perfil", link: "/incidencias-urbanas/editar-perfil " },
        { text: "Consultar incidencias", link: "/incidencias-urbanas/consultar-incidencias" },
    ]
  };

export default function Sidebar() {
  const location = useLocation();

  const opciones = opcionesGlobales.SinRegistro  // Se consulta en la bbdd que usuario esta autenticado
    
  return (
    <aside className="urban-sidebar__sidebar">

      <nav className="urban-sidebar__nav">
        {opciones.map((option, index) => (
          <Link
            key={index}
            to={option.link}
            className={`urban-sidebar__sidebar-title ${
              location.pathname === option.link ? "urban-sidebar__sidebar-title--active" : ""
            }`}
          >
            <span>{option.text}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}