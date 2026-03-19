import { useState } from 'react';
import { useNavigate } from 'react-router';
import Hero from "../assets/components/Hero";
import Sidebar from "../assets/components/Sidebar";
import "../assets/css/Registrarse.css";

export default function Registrarse() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [cp, setCp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos al backend y registrar al usuario
    console.log("Registrando usuario:", { nombre, cp, email, password });
  };

  return (
    <>
      <Hero />

      <main className="urban-register__layout">
        <Sidebar active="registro" />

        <section className="urban-register__content">
          <h1 className="urban-register__title">Registrarse</h1>

          <p className="urban-register__subtitle">
            Consulta toda la información relacionada con incidencias urbanas
          </p>

          <form className="urban-register__form">
            <div className="urban-register__group">
              <label htmlFor="nombre" className="urban-register__label">
                Nombre:
              </label>
              <input
                id="nombre"
                type="text"
                placeholder="Escribe aquí tu nombre..."
                className="urban-register__input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="urban-register__group">
              <label htmlFor="cp" className="urban-register__label">
                Código Postal:
              </label>
              <input
                id="cp"
                type="text"
                placeholder="Escribe aquí tu código postal..."
                className="urban-register__input"
                value={cp}
                onChange={(e) => setCp(e.target.value)}
              />
            </div>

            <div className="urban-register__group">
              <label htmlFor="email" className="urban-register__label">
                Email:
              </label>
              <input
                id="email"
                type="email"
                placeholder="Escribe aquí tu email..."
                className="urban-register__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="urban-register__group">
              <label htmlFor="password" className="urban-register__label">
                Contraseña:
              </label>
              <input
                id="password"
                type="password"
                placeholder="Escribe aquí tu contraseña..."
                className="urban-register__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="urban-register__actions">
              <button type="button" className="urban-register__button" onClick={() => navigate(-1)}>
                Cancelar
              </button>
              <button type="submit" className="urban-register__button" onClick={handleSubmit}>
                Registrarse
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}