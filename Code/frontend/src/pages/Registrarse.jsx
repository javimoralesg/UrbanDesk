import Hero from "../assets/components/Hero";
import Sidebar from "../assets/components/Sidebar";
import "../assets/css/Registrarse.css";

export default function Registrarse() {
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
              />
            </div>

            <div className="urban-register__actions">
              <button type="button" className="urban-register__button">
                Cancelar
              </button>
              <button type="submit" className="urban-register__button">
                Registrarse
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}