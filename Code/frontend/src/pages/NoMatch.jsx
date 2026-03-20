import { Link } from 'react-router'
import '../assets/css/NoMatch.css'


export default function NoMatch() {
  return (
    <main className="no-match">
      <div className="no-match__box">
        <Link to="/"> <img src="/logo.png" alt="logo" className="no-match__logo" /> </Link>
        <h2 className="no-match__subtitle">Página no encontrada</h2>
        <p className="no-match__text">
          La URL que has introducido no existe en UrbanDesk.
        </p>

        <Link to="/" className="no-match__button">
            VOLVER A LA PÁGINA PRINCIPAL
        </Link>
      </div>
    </main>
  )
}