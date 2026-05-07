import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import { api } from '../services/api';
import "../assets/css/Registrarse.css";
import Popups from '../components/Popups';
import PoliticaPrivacidad from '../components/PoliticaPrivacidad';


export default function Registrarse() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [cp, setCp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [incidenceList, setIncidenceList] = useState([]);

  const [acceptTerms, setAcceptTerms] = useState(false);

  const [passwordFocused, setPasswordFocused] = useState(false);

  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  useEffect(() => {
    if (loading) {
      setIncidenceList(prev => ([...prev, { id: 'loading', message: 'Registrando usuario', type: 'waiting' }]));
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

  const handlePrivacyAccept = () => {
    setAcceptTerms(true);
    setPrivacyModalOpen(false);
  };

  const handleTermsCheckboxChange = (e) => {
    if (e.target.checked) {
      if (hasScrolledToEnd) {
        setAcceptTerms(true);
      } else {
        setPrivacyModalOpen(true);
      }
    } else {
      setAcceptTerms(false);
    }
  };


  const isPasswordValid = (value) => {
    const hasMinLength = value.length >= 8;
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[,*.!?.:;\-_{}|()/¿¡#@$%&"'€+]/.test(value);

    return hasMinLength && hasNumber && hasSpecialChar;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, un número y un carácter especial (,*.!?)");
      return;
    }

    if (!acceptTerms) {
      setError("Debes aceptar la política de privacidad y protección de datos para registrarte.");
      return;
    }

    if (!nombre) {
      setError("Por favor, completa tu nombre.");
      return;
    }

    if (!cp) {
      setError("Por favor, completa tu código postal.");
      return;
    }

    if (!email) {
      setError("Por favor, completa tu email.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.register({
        nombre: nombre,
        email: email,
        password: password,
        codigoPostal: cp
      });

      setLoading(false);
      setIncidenceList(prev => ([...prev, { id: 'success', message: 'Consulte su correo para validar su cuenta', type: 'success' }]));
      
      setTimeout(() => {
        navigate('/incidencias-urbanas/login');
      }, 3500);

    } catch (error) {
      setLoading(false);
      setError(error.message || "Error al registrar usuario");
    }
  };

  return (
    <>
      <PoliticaPrivacidad
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        onAccept={handlePrivacyAccept}
        onScrolledToEnd={(scrolledToEnd) => setHasScrolledToEnd(scrolledToEnd)}
        hasScrolledToEnd={hasScrolledToEnd}
      />
      <Popups list={incidenceList} />
      <Hero />

      <main className="urban-register__layout">
        <Sidebar />


        <section className="urban-register__content">
          <h2 className="urban-register__title">
            Registrarse
          </h2>

          <p className="urban-register__subtitle">
            Regístrese en UrbanDesk
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
              <div className="urban-register__password-field">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Escribe aquí tu contraseña..."
                  className="urban-register__input urban-register__input--password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#4a5568",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px",
                    outline: "none"
                  }}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>

              </div>
              <ul className={`urban-register__password-requirements${passwordFocused ? ' visible' : ''}`}>
                <li className={password.length >= 8 ? "met" : "unmet"}>
                  <span className="icon">{password.length >= 8 ? "✓" : "✕"}</span> Al menos 8 caracteres
                </li>
                <li className={/\d/.test(password) ? "met" : "unmet"}>
                  <span className="icon">{/\d/.test(password) ? "✓" : "✕"}</span> Un número
                </li>
                <li className={/[,*.!?.:;\-_{}|()/¿¡#@$%&"'€+]/.test(password) ? "met" : "unmet"}>
                  <span className="icon">{/[,*.!?.:;\-_{}|()/¿¡#@$%&"'€+]/.test(password) ? "✓" : "✕"}</span> Un carácter especial (,*.!?)
                </li>
              </ul>
            </div>

            <div className="urban-register__checkbox-group">
              <input
                id="acceptTerms"
                type="checkbox"
                className="urban-register__checkbox"
                checked={acceptTerms}
                onChange={handleTermsCheckboxChange}
              />
              <label htmlFor="acceptTerms">
                Acepto la <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPrivacyModalOpen(true);
                  }}
                  className="urban-register__checkbox-link"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3770b1',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    font: 'inherit'
                  }}
                >
                  política de privacidad y protección de datos
                </button>
              </label>
            </div>

            <div className="urban-register__actions">
              <button type="button" className="urban-register__button" onClick={() => navigate("/incidencias-urbanas")}>
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