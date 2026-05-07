import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import Popups from "../components/Popups";
import { api } from "../services/api";
import "../assets/css/EditarPerfil.css";

export default function EditarPerfil() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    codigoPostal: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [popups, setPopups] = useState([]);
  const [isCiudadano, setIsCiudadano] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const isPasswordValid = (value) => {
    const hasMinLength = value.length >= 8;
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[,*.!?.:;-_{}|()/¿¡#@$%&"'€+]/.test(value);

    return hasMinLength && hasNumber && hasSpecialChar;
  };

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (!user) {
        window.location.href = "/incidencias-urbanas/login";
        return;
      }

      setIsCiudadano(user.rol === "CIUDADANO");

      setIsRestricted(user.rol === "OPERADOR" || user.rol === "TECNICO");

      setForm({
        nombre: user.nombre || "",
        email: user.email || "",
        codigoPostal: user.codigoPostal || "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error al cargar usuario en EditarPerfil:", error);
      window.location.href = "/incidencias-urbanas/login";
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = () => {
    setConfirmPopup({
      type: 'error',
      message: '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      acceptText: 'Aceptar',
      cancelText: 'Cancelar',
      onAccept: async () => {
        setConfirmPopup(null);
        try {
          await api.deleteAccount();
          localStorage.removeItem('user');
          window.location.href = "/incidencias-urbanas/login";
        } catch (error) {
          setPopups([{ type: 'error', message: error.message || "Error al eliminar la cuenta" }]);
          setTimeout(() => setPopups([]), 5000);
        }
      },
      onCancel: () => setConfirmPopup(null),
      persistent: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isRestricted && (!form.nombre || !form.email)) {
      setPopups([{ type: 'error', message: 'Nombre y email son obligatorios' }]);
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      setPopups([{ type: 'error', message: 'Las contraseñas no coinciden' }]);
      return;
    }

    if (form.password && !isPasswordValid(form.password)) {
      setPopups([{ type: 'error', message: 'La contraseña debe tener al menos 8 caracteres, un número y un carácter especial (,*.!?)' }]);
      return;
    }

    try {
      setPopups([{ type: 'waiting', message: 'Guardando cambios...' }]);

      const userData = {};

      if (!isRestricted) {
        userData.nombre = form.nombre;
        userData.email = form.email;
        userData.codigoPostal = form.codigoPostal;
      }

      if (form.password) {
        userData.password = form.password;
      }

      const result = await api.updateProfile(userData);

      if (result.requiresRelogin) {
        setPopups([{ type: 'success', message: 'Perfil actualizado correctamente. Inicia sesión de nuevo.' }]);
        setTimeout(() => {
          window.location.href = "/incidencias-urbanas/login";
        }, 1500);
      } else {
        setPopups([{ type: 'success', message: 'Perfil actualizado correctamente' }]);
        setTimeout(() => {
          setPopups([]);
          window.location.href = "/incidencias-urbanas";
        }, 1500);
      }

    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setPopups([{ type: 'error', message: error.message || "Error al actualizar el perfil" }]);
      setTimeout(() => setPopups([]), 5000);
    }
  };

  return (
    <div className="editar-perfil">
      <Hero />
      <div className="editar-perfil__layout">
        <Sidebar />
        <main className="mis-incidencias__content">
          <h2 className="mis-incidencias__title">Editar perfil</h2>
          <p className="mis-incidencias__subtitle">
            Edite su información personal y cambie su contraseña. Si no desea cambiar algún campo, deje el valor actual o el campo de contraseña vacío.
          </p>

          <form className="editar-perfil__form" onSubmit={handleSubmit}>
            <div className="editar-perfil__field">
              <label htmlFor="nombre">Nombre:</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                disabled={isRestricted}
              />
            </div>

            <div className="editar-perfil__field">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={isRestricted}
              />
            </div>

            {isCiudadano && (
              <div className="editar-perfil__field">
                <label htmlFor="codigoPostal">Código postal:</label>
                <input
                  id="codigoPostal"
                  type="text"
                  name="codigoPostal"
                  value={form.codigoPostal}
                  onChange={handleChange}
                  disabled={isRestricted}
                />
              </div>
            )}

            <div className="editar-perfil__field" style={{ position: "relative" }}>
              <label htmlFor="password">Nueva contraseña:</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  style={{ paddingRight: "44px" }}
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
              <ul className={`urban-register__password-requirements${passwordFocused ? ' visible' : ''}`} style={{ zIndex: 1000 }}>
                <li className={form.password.length >= 8 ? "met" : "unmet"}>
                  <span className="icon">{form.password.length >= 8 ? "✓" : "✕"}</span> Al menos 8 caracteres
                </li>
                <li className={/\d/.test(form.password) ? "met" : "unmet"}>
                  <span className="icon">{/\d/.test(form.password) ? "✓" : "✕"}</span> Un número
                </li>
                <li className={/[,*.!?.:;\-_{}|()/¿¡#@$%&"'€+]/.test(form.password) ? "met" : "unmet"}>
                  <span className="icon">{/[,*.!?.:;\-_{}|()/¿¡#@$%&"'€+]/.test(form.password) ? "✓" : "✕"}</span> Un carácter especial (,*.!?)
                </li>
              </ul>
            </div>

            <div className="editar-perfil__field">
              <label htmlFor="confirmPassword">Confirmar contraseña:</label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  style={{ paddingRight: "44px" }}
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
            </div>

            <div className={`editar-perfil__actions ${isCiudadano ? "editar-perfil__actions--two-columns" : "editar-perfil__actions--center"}`}>
              {isCiudadano && (
                <button
                  type="button"
                  className="editar-perfil__delete-button"
                  onClick={handleDelete}
                >
                  Eliminar cuenta
              </button>
              )}

              <button
                type="submit"
                className="editar-perfil__button"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </main>
      </div>
      <Popups list={[...popups, ...(confirmPopup ? [confirmPopup] : [])]} />
    </div>
  );
}