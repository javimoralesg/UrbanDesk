import { Link } from 'react-router';
import "../css/Cards.css";


export default function Cards() {

  const cardsData = [
    {
      id: 1,
      text: "Registrarse",
      link: "/register",
      wide: false,
    },
    {
      id: 2,
      text: "Iniciar sesión",
      link: "/login",
      wide: false,
    },
    {
      id: 3,
      text: "Registrar incidencia",
      link: "/registrar-incidencia",
      wide: true,
    },
  ];

  return (
    <section className="urban-home__cards">
      {cardsData.map((card) => (
        <Link
          key={card.id}
          to={card.link}
          className={`urban-home__action-card ${
            card.wide ? "urban-home__action-card--wide" : ""
          }`}
        >
          <span>{card.text}</span>
        </Link>
      ))}
    </section>
  );
}