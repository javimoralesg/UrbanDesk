import { useState, useEffect, useRef } from 'react';
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
  const [loadingMessage, setLoadingMessage] = useState("Cargando...");
  const [error, setError] = useState(null);

  const [incidenceList, setIncidenceList] = useState([]);

  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);
  const hasValidatedRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingMessage("Iniciando sesión...");
      setLoading(true);
      setError(null);

      await api.login(
        email,
        password
      );

      setLoading(false);

      navigate('/incidencias-urbanas');

    } catch (err) {
      setLoading(false);
      setError(err.message || "Error al iniciar sesión");
    }

  };

  const handleRecoverEmail = async (e) => {
    e.preventDefault();
    try {
      setLoadingMessage("Enviando código de recuperación...");
      setLoading(true);
      setError(null);
      await api.recuperarCuenta(recoveryEmail);
      setLoading(false);
      setIncidenceList(prev => ([...prev, { id: 'success', message: 'Código enviado a tu correo.', type: 'success' }]));
      setTimeout(() => setIncidenceList(prev => prev.filter(m => m.id !== 'success')), 5000);
      setRecoveryStep(2);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Error al enviar el correo");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoadingMessage("Restableciendo contraseña...");
      setLoading(true);
      setError(null);
      await api.restablecerCuenta(recoveryCode.replace(/\s/g, ''), recoveryPassword);
      setLoading(false);
      setIncidenceList(prev => ([...prev, { id: 'success', message: 'Contraseña restablecida correctamente.', type: 'success' }]));
      setTimeout(() => setIncidenceList(prev => prev.filter(m => m.id !== 'success')), 5000);
      setShowRecovery(false);
      setRecoveryStep(1);
      setRecoveryEmail("");
      setRecoveryCode("");
      setRecoveryPassword("");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Error al restablecer contraseña");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const validar = async () => {
      try {
        setLoadingMessage("Validando cuenta...");
        setLoading(true);
        await api.validarCuenta(token);
        setLoading(false);
        setIncidenceList(prev => ([...prev, { id: 'success', message: 'Cuenta validada correctamente. Ya puedes iniciar sesión.', type: 'success' }]));
        setTimeout(() => setIncidenceList(prev => prev.filter(m => m.id !== 'success')), 5000);
        window.history.replaceState(null, '', window.location.pathname);
      } catch (err) {
        setLoading(false);
        setError(err.message || "Error al validar la cuenta");
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    if (token && !hasValidatedRef.current) {
      hasValidatedRef.current = true;
      validar();
    }
  }, []);

  useEffect(() => {
    if (loading) {
      setIncidenceList(prev => {
        const filtered = prev.filter(m => m.id !== 'loading');
        return [...filtered, { id: 'loading', message: loadingMessage, type: 'waiting' }];
      });
    } else {
      setIncidenceList(prev => prev.filter(m => m.id !== 'loading'));
    }
    if (error) {
      setIncidenceList(prev => ([...prev, { id: 'error', message: error, type: 'error' }]));
      setTimeout(() => {
        setIncidenceList(prev => prev.filter(m => m.id !== 'error'));
        setError(null);
      }, 5000);
    }
  }, [loading, loadingMessage, error]);

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

            <div style={{ textAlign: "right", margin: "10px 0 20px" }}>
              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                style={{ background: "none", border: "none", color: "#3182ce", textDecoration: "underline", cursor: "pointer", fontSize: "0.9rem", outline: "none" }}
              >
                ¿Olvidaste tu contraseña?
              </button>
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

      {showRecovery && (
        <div 
          onClick={() => setShowRecovery(false)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center",
            alignItems: "center", zIndex: 9999
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white", padding: "2rem", borderRadius: "12px", position: "relative",
              width: "90%", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
            }}
          >
            <button
              type="button"
              onClick={() => setShowRecovery(false)}
              style={{
                position: "absolute", top: "15px", right: "15px", background: "none",
                border: "none", cursor: "pointer", color: "#a0aec0", padding: "5px", outline: "none"
              }}
              title="Cerrar"
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "24px", height: "24px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            {recoveryStep === 1 ? (
              <>
              <form onSubmit={handleRecoverEmail}>
                <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#2d3748" }}>Recuperar cuenta</h3>
                <p style={{ marginBottom: "1.5rem", fontSize: "0.95rem", color: "#4a5568" }}>
                  Introduce tu email y te enviaremos un código de recuperación.
                </p>
                <div className="urban-login__group">
                  <label htmlFor="recoveryEmail" className="urban-login__label">Email:</label>
                  <input
                    id="recoveryEmail"
                    type="email"
                    className="urban-login__input"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="urban-login__actions" style={{ marginTop: "1.5rem", display: "flex", gap: "10px" }}>
                  <button type="submit" className="urban-login__button">Enviar código</button>
                </div>
              </form>
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button type="button" onClick={(e) => { e.preventDefault(); setRecoveryStep(2); }} style={{ background: "none", border: "none", color: "#3182ce", textDecoration: "underline", cursor: "pointer", fontSize: "0.85rem", outline: "none" }}>
                  Ya tengo un código de recuperación
                </button>
              </div>
              </>
            ) : (
              <>
              <form onSubmit={handleResetPassword}>
                <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#2d3748" }}>Restablecer contraseña</h3>
                <p style={{ marginBottom: "1.5rem", fontSize: "0.95rem", color: "#4a5568" }}>
                  Introduce el código que has recibido y tu nueva contraseña.
                </p>
                <div className="urban-login__group" style={{ marginBottom: "1rem" }}>
                  <label className="urban-login__label">Código de 6 dígitos:</label>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', padding: "0 10px" }}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        id={`code-input-${index}`}
                        type="text"
                        maxLength="1"
                        value={recoveryCode[index] && recoveryCode[index] !== ' ' ? recoveryCode[index] : ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newCode = recoveryCode.padEnd(6, ' ').split('');
                          newCode[index] = value.slice(-1) || ' ';
                          setRecoveryCode(newCode.join(''));
                          if (value && index < 5) {
                            document.getElementById(`code-input-${index + 1}`)?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && (!recoveryCode[index] || recoveryCode[index] === ' ') && index > 0) {
                            document.getElementById(`code-input-${index - 1}`)?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pasted = e.clipboardData.getData('text').replace(/\s/g, '').slice(0, 6);
                          setRecoveryCode(pasted.padEnd(6, ' '));
                          const targetIndex = Math.min(pasted.length, 5);
                          document.getElementById(`code-input-${targetIndex}`)?.focus();
                        }}
                        style={{
                          width: "42px",
                          height: "50px",
                          textAlign: "center",
                          fontSize: "1.5rem",
                          border: "0px",
                          borderBottom: "2px solid #cbd5e0",
                          borderRadius: "0px",
                          outline: "none",
                          backgroundColor: "#fff",
                          transition: "all 0.2s"
                        }}

                        required
                      />
                    ))}
                  </div>
                </div>
                <div className="urban-login__group" style={{ position: "relative" }}>
                  <label htmlFor="recoveryPassword" className="urban-login__label">Nueva contraseña:</label>
                  <div style={{ display: "flex", position: "relative" }}>
                    <input
                      id="recoveryPassword"
                      type={showRecoveryPassword ? "text" : "password"}
                      className="urban-login__input"
                      value={recoveryPassword}
                      onChange={(e) => setRecoveryPassword(e.target.value)}
                      required
                      style={{ paddingRight: "40px", flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRecoveryPassword(!showRecoveryPassword)}
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
                      title={showRecoveryPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showRecoveryPassword ? (
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
                </div>
                <div className="urban-login__actions" style={{ marginTop: "1.5rem", display: "flex", gap: "10px" }}>
                  <button type="submit" className="urban-login__button">Restablecer</button>
                </div>
              </form>
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button type="button" onClick={(e) => { e.preventDefault(); setRecoveryStep(1); }} style={{ background: "none", border: "none", color: "#3182ce", textDecoration: "underline", cursor: "pointer", fontSize: "0.85rem", outline: "none" }}>
                  Volver para solicitar otro código
                </button>
              </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}