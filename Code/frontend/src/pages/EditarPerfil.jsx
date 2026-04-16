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

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (!user) {
        window.location.href = "/incidencias-urbanas/login";
        return;
      }

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

    try {
      setLoading(true);

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
          alert("Perfil actualizado correctamente. Inicia sesión de nuevo.");
          window.location.href = "/incidencias-urbanas/login";
      } else {
          setPopups([{ type: 'success', message: 'Perfil actualizado correctamente' }]);
          setTimeout(() => setPopups([]), 3000);
          window.location.href = "/incidencias-urbanas";
        }

    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setPopups([{ type: 'error', message: error.message || "Error al actualizar el perfil" }]);
      setTimeout(() => setPopups([]), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editar-perfil">
      <Hero />
      <div className="editar-perfil__layout">
        <Sidebar />
        <main className="editar-perfil__content">
          <h1 className="editar-perfil__title">Editar perfil</h1>

          <form className="editar-perfil__form" onSubmit={handleSubmit}>
            <div className="editar-perfil__field">
              <label htmlFor="nombre">Nombre</label>
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
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={isRestricted}
              />
            </div>

            <div className="editar-perfil__field">
              <label htmlFor="codigoPostal">Código postal</label>
              <input
                id="codigoPostal"
                type="text"
                name="codigoPostal"
                value={form.codigoPostal}
                onChange={handleChange}
                disabled={isRestricted}
              />
            </div>

            <div className="editar-perfil__field">
              <label htmlFor="password">Nueva contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="editar-perfil__field">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="editar-perfil__button"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </main>
      </div>
      <Popups list={popups} />
    </div>
  );
}