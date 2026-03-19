import { useState } from 'react';
import { useNavigate } from 'react-router';
import Hero from "../assets/components/Hero";
import Sidebar from "../assets/components/Sidebar";
import "../assets/css/IniciarSesion.css";

export default function IniciarSesion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos al backend y autenticar al usuario
    console.log("Iniciando sesión con:", { email, password });
  };

  return (
    <>
      <Hero />
      <main className="urban-login__layout">
        <Sidebar />

        
        <section className="urban-login__content">
          <h2 className="urban-login__title">
            Iniciar sesión
          </h2>
          <p className="urban-login__subtitle">
            Consulta toda la información relacionada con incidencias urbanas
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
              <button type="button" className="urban-login__button" onClick={() => navigate(-1)}>Cancelar</button>
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