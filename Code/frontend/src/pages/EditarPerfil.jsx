import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
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

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (!user) {
        window.location.href = "/incidencias-urbanas/login";
        return;
      }

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

    if (!form.nombre || !form.email) {
      alert("Nombre y email son obligatorios");
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);

      const userData = {
        nombre: form.nombre,
        email: form.email,
        codigoPostal: form.codigoPostal,
      };

      if (form.password) {
        userData.password = form.password;
      }

      const result = await api.updateProfile(userData);

      if (result.requiresRelogin) {
          alert("Perfil actualizado correctamente. Inicia sesión de nuevo.");
          window.location.href = "/incidencias-urbanas/login";
      } else {
          alert("Perfil actualizado correctamente");
          window.location.href = "/incidencias-urbanas";
        }

    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert(error.message || "Error al actualizar el perfil");
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
    </div>
  );
}