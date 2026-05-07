import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import { api } from '../services/api';
import "../assets/css/Registrarse.css";
import Popups from '../components/Popups';


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
                  className="urban-register__password-toggle"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <div className={`urban-register__password-requirements ${isPasswordValid(password) ? 'right' : 'wrong'}${passwordFocused ? ' visible' : ''}`}>
                La contraseña contiene al menos 8 caracteres {password.length >= 8 ? "✅" : "❌"}<br />
                La contraseña contiene un número {/\d/.test(password) ? "✅" : "❌"}<br />
                La contraseña contiene un carácter especial (,*.!?) {/[,*.!?.:;\-_{}|()/¿¡#@$%&"'€+]/.test(password) ? "✅" : "❌"}
              </div>
            </div>

            <div className="urban-register__checkbox-group">
              <input
                id="acceptTerms"
                type="checkbox"
                className="urban-register__checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="acceptTerms">
                Acepto la <a href="/politica-privacidad" target="_blank" rel="noopener noreferrer" className="urban-register__checkbox-link">política de privacidad y protección de datos</a>
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