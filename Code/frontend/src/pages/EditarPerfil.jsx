import { useState, useEffect, use } from 'react';
import { useNavigate } from "react-router";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import { api } from '../services/api';
import "../assets/css/Registrarse.css";

export default function EditarPerfil() {

    const [nombre, setNombre] = useState("");
    const [cp, setCp] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setNombre(user.nombre || "");
            setCp(user.codigoPostal || "");
            setEmail(user.email || "");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

    }


    return (
        <>
            <Hero />

            <main className="urban-register__layout">
                <Sidebar />


                <section className="urban-register__content">
                    <h2 className="urban-register__title">
                        Editar perfil
                    </h2>

                    <p className="urban-register__subtitle">
                        Modifique los datos de su perfil
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
                                Contraseña Nueva:
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


                        <div className="urban-register__group">
                            <label htmlFor="password" className="urban-register__label">
                                Repetir Contraseña Nueva:
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Escribe aquí tu contraseña..."
                                className="urban-register__input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div className="urban-register__actions">
                            <button type="button" className="urban-register__button" onClick={() => navigate("/incidencias-urbanas")}>
                                Cancelar
                            </button>
                            <button type="submit" className="urban-register__button">
                                Actualizar
                            </button>
                        </div>
                    </form>
                </section>

            </main>
        </>
    );
}