import { useState } from 'react';
import { useNavigate } from 'react-router';
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import "../assets/css/Registrarse.css";

export default function Registrarse() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [cp, setCp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Registrando usuario:", { nombre, cp, email, password });
    const usuario = {
      nombre: nombre,
      email: email,
      passwordHash: password, 
      codigoPostal: cp
    };
    try {
      const response = await fetch("http://localhost:8080/api/usuarios/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        throw new Error("Error en el registro");
      }

      const data = await response.json();
      console.log("Usuario creado:", data);

      navigate("incidencias-urbanas/login");
    } catch (error) {
      console.error("Error al registrar usuario:", error);
    }
  };

  return (
    <>
      <Hero />

      <main className="urban-register__layout">
        <Sidebar/>

        
        <section className="urban-register__content">
          <h2 className="urban-register__title">
            Registrarse
          </h2>

          <p className="urban-register__subtitle">
            ####Falta por cambiar
          </p>

          <form className="urban-register__form" onSubmit={handleSubmit}>
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