import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import "../assets/css/IniciarSesion.css";
import { api } from '../services/api';
import Popups from '../components/Popups';


export default function IniciarSesion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [incidenceList, setIncidenceList] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await api.login(
        email,
        password
      );

      setLoading(false);

      navigate('/incidencias-urbanas');

    } catch (error) {
      setLoading(false);
      setError("Error al iniciar sesión");
    }

  };

  useEffect(() => {
    if (loading) {
      setIncidenceList(prev => ([...prev, { id: 'loading', message: 'Iniciando sesión', type: 'waiting' }]));
    }
    if (!loading) {
      setIncidenceList(prev => prev.filter(m => m.id !== 'loading'));
    }
    if (error) {
      setIncidenceList(prev => ([...prev, { id: 'error', message: error, type: 'error' }]));
      setTimeout(() => {
        setIncidenceList(prev => prev.filter(m => m.id !== 'error'));
        setError(null);
      }, 5000);
    }
  }, [loading, error]);

  return (
    <>
      <Popups list={incidenceList} />
      <Hero />
      <main className="urban-login__layout">
        <Sidebar />


        <section className="urban-login__content">
          <h2 className="urban-login__title">
            Iniciar sesión
          </h2>
          <p className="urban-login__subtitle">
            Inicie sesión en su cuenta
          </p>

          <form className="urban-login__form">
            <div className="urban-login__group">
              <label htmlFor="email" className="urban-login__label">Email:</label>
              <input
                id="email"
                type="email"
                placeholder="Escribe aquí tu email..."
                className="urban-login__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="urban-login__group">
              <label htmlFor="password" className="urban-login__label">Contraseña:</label>
              <input
                id="password"
                type="password"
                placeholder="Escribe aquí tu contraseña..."
                className="urban-login__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="urban-login__actions">
              <button type="button" className="urban-login__button" onClick={() => navigate("/incidencias-urbanas")}>Cancelar</button>
              <button type="submit" className="urban-login__button" onClick={handleSubmit}>
                Iniciar sesión
              </button>
            </div>
          </form>
        </section>

      </main>
    </>
  );
}