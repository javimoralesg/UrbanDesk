const BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return {};
        const user = JSON.parse(raw);
        if (user && user.authdata) {
            return { Authorization: 'Basic ' + user.authdata };
        }
    } catch {
        console.error("Error al obtener las credenciales de autenticación");
    }
    return {};
};

async function parseJsonOrThrow(response) {
    if (response.ok) {
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }
    let message = `Error ${response.status}`;
    try {
        const data = JSON.parse(await response.text());
        if (data.error) message = data.error;
        else if (data.message) message = data.message;
    } catch {
        console.error("Error al parsear el mensaje de error:", response.status);
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
}

const INACTIVITY_TIMEOUT_MINUTES = 20;
let inactivityTimer = null;

function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        api.logout();
        window.location.href = "/incidencias-urbanas";
    }, INACTIVITY_TIMEOUT_MINUTES * 60 * 1000);
}

['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    window.addEventListener(event, resetInactivityTimer);
});
resetInactivityTimer();

export const api = {
    login: async (email, password) => {
        resetInactivityTimer();
        const authdata = window.btoa(email + ':' + password);
        const headers = {
            'Authorization': 'Basic ' + authdata,
            'Content-Type': 'application/json',
        };

        const response = await fetch(`${BASE_URL}/usuarios/login`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ email, password }),
        });

        const user = await parseJsonOrThrow(response);
        user.authdata = authdata;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    },

    logout: () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        localStorage.removeItem('user');
        window.location.href = "/incidencias-urbanas";
    },

    register: async (userData) => {
        resetInactivityTimer();
        const email = userData.email;
        const password = userData.password;
        const response = await fetch(`${BASE_URL}/usuarios/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        const user = await parseJsonOrThrow(response);
        if (email && password) {
            const authdata = window.btoa(email + ':' + password);
            user.authdata = authdata;
            localStorage.setItem('user', JSON.stringify(user));
        }
        return user;
    },

    updateProfile: async (userData) => {
        resetInactivityTimer();

        const response = await fetch(`${BASE_URL}/usuarios/perfil`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(userData),
        });

        const updatedUser = await parseJsonOrThrow(response);

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        const finalEmail = userData.email || currentUser.email;
        const finalPassword = userData.password || null;

        if (finalEmail && finalPassword) {
            updatedUser.authdata = window.btoa(finalEmail + ':' + finalPassword);
        } else {
            updatedUser.authdata = currentUser.authdata;
        }

        localStorage.setItem('user', JSON.stringify(updatedUser));

        return updatedUser;
        },

    getIncidents: async () => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/incidencias`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return parseJsonOrThrow(response);
    },

    validateDescription: async (descripcion) => {
        resetInactivityTimer();
        const response = await fetch("https://urbandeskvalidate-g475okyxfq-uc.a.run.app", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth': import.meta.env.VITE_IA_API_KEY
            },
            body: JSON.stringify({ userMessage: descripcion }),
        });

        const ops = await response.json();
        try {
            const parsedAnswer = JSON.parse(ops.reply);
            return JSON.stringify(parsedAnswer);
        } catch (e) {
            console.error("Error parsing validation response:", e);
        }

        const answer = { valid: true };
        return answer;
    },

    transcribeAndProcessAudio: async (audioBase64) => {
        resetInactivityTimer();
        const response = await fetch("https://urbandesk-g475okyxfq-uc.a.run.app", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth': import.meta.env.VITE_IA_API_KEY
            },
            body: JSON.stringify({ audioBase64 }),
        });

        if (!response.body) {
            throw new Error("ReadableStream no soportado.");
        }

        return response;
    },

    obtenerIncidenciaPorId: async (id) => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/incidencias/${id}`, {
            headers: getAuthHeaders(),
        });

        if (response.ok) {
            return await response.json();
        }

        let message = "Error al obtener la incidencia";
        try {
            const errorData = await response.json();
            message = errorData?.message || errorData?.error || message;
        } catch {
            try {
                message = (await response.text()) || message;
            } catch {
            }
        }

        const error = new Error(
            response.status === 404 || /incidencia no encontrada/i.test(message)
                ? "Incidencia no encontrada"
                : "Error al obtener la incidencia"
        );
        error.status = response.status;
        error.message = message;
        throw error;
    },

    crearIncidencia: async ({ direccion, latitud, longitud, descripcion, ciudadanoId, imagenes = [] }) => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/incidencias`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({
                direccion,
                latitud,
                longitud,
                descripcion,
                ciudadanoId,
                imagenes,
            }),
        });

        if (!response.ok) {
            throw new Error("Error al crear la incidencia");
        }

        return await response.json();
    },

    actualizarIncidencia: async (id, { direccion, latitud, longitud, descripcion }) => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/incidencias/${id}/editar`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({
                direccion,
                latitud,
                longitud,
                descripcion,
            }),
        });

        if (!response.ok) {
            throw new Error("Error al actualizar la incidencia");
        }

        return await response.json();
    },

    validarIncidencia: async (id, observaciones, prioridad) => {
        resetInactivityTimer();
        const params = new URLSearchParams({ observaciones, prioridad });

        const response = await fetch(`${BASE_URL}/incidencias/${id}/validar?${params.toString()}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
        });

        if (!response.ok) {
            throw new Error("Error al validar la incidencia");
        }

        return parseJsonOrThrow(response);
    },

    rechazarIncidencia: async (id, comentario = "Rechazada por el operador.") => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/incidencias/${id}/rechazar`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ comentario }),
        });

        if (!response.ok) {
            throw new Error("Error al rechazar la incidencia");
        }

        return await response.json();
    },

    asignarTecnicoIncidencia: async (id, tecnicoId) => {
        resetInactivityTimer();
        const response = await fetch(
            `${BASE_URL}/incidencias/${id}/tecnico/${tecnicoId}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error("Error al asignar técnico");
        }

        return await response.json();
    },

    eliminarTecnicoIncidencia: async (id, tecnicoId) => {
        resetInactivityTimer();
        const response = await fetch(
            `${BASE_URL}/incidencias/${id}/tecnico/${tecnicoId}`,
            {
                method: "DELETE",
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error("Error al eliminar técnico");
        }

        return await response.json();
    },
}