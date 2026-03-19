import { Link } from 'react-router';
import "../css/Cards.css";


export default function Cards() {

  const cardsData = [
    {
      id: 1,
      text: "Registrarse",
      link: "/incidencias-urbanas/register",
      wide: false,
    },
    {
      id: 2,
      text: "Iniciar sesión",
      link: "/incidencias-urbanas/login",
      wide: false,
    },
    {
      id: 3,
      text: "Registrar incidencia",
      link: "/incidencias-urbanas/registrar-incidencia",
      wide: true,
    },
  ];

  return (
    <section className="urban-cards__cards">
      {cardsData.map((card) => (
        <Link
          key={card.id}
          to={card.link}
          className={`urban-cards__action-card ${
            card.wide ? "urban-cards__action-card--wide" : ""
          }`}
        >
          <span>{card.text}</span>
        </Link>
      ))}
    </section>
  );
}