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

// Escucha eventos de actividad del usuario
['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    window.addEventListener(event, resetInactivityTimer);
});
resetInactivityTimer();


export const api = {
    // funciones asíncronas que se usan en los jsx y que hacen las peticiones al backend

    login: async (email, password) => {
        resetInactivityTimer();
        const authdata = window.btoa(email + ':' + password);
        const headers = {
            'Authorization': 'Basic ' + authdata,
            'Content-Type': 'application/json',
        };
        console.log("Iniciando sesión con email:", email);
        console.log("Authdata generado:", authdata);

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

    getIncidents: async () => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/incidencias`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return parseJsonOrThrow(response);
    },
    



    // llamadas a la api de IA 
    validateDescription: async (descripcion) => {
        const response = await fetch("https://urbandeskvalidate-g475okyxfq-uc.a.run.app", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth': import.meta.env.VITE_IA_API_KEY
            },
            body: JSON.stringify({ userMessage: descripcion }),
        });

        const ops = await response.json()
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

        return response
    },

    obtenerTodasIncidencias: async () => {
        const response = await fetch("http://localhost:8080/api/incidencias");

        if (!response.ok) {
        throw new Error("Error al obtener todas las incidencias");
        }

        return await response.json();
    },

    obtenerIncidenciaPorId: async (id) => {
        const response = await fetch(`http://localhost:8080/api/incidencias/${id}`);

        if (!response.ok) {
        throw new Error("Error al obtener la incidencia");
        }

        return await response.json();
    },

    obtenerIncidenciasPorEstado: async (estado) => {
        const response = await fetch(`http://localhost:8080/api/incidencias/estado/${estado}`);

        if (!response.ok) {
        throw new Error("Error al obtener incidencias por estado");
        }

        return await response.json();
    },    

    obtenerIncidenciasPorCiudadano: async (idCiudadano) => {
        const response = await fetch(`http://localhost:8080/api/incidencias/ciudadano/${idCiudadano}`);

        if (!response.ok) {
        throw new Error("Error al obtener incidencias del ciudadano");
        }

        return await response.json();
    },

    obtenerIncidenciasPorPrioridad: async (prioridad) => {
        const response = await fetch(`http://localhost:8080/api/incidencias/prioridad/${prioridad}`);

        if (!response.ok) {
        throw new Error("Error al obtener incidencias por prioridad");
        }

        return await response.json();
    },

    obtenerIncidenciasPorTecnico: async (tecnicoId) => {
        const response = await fetch(`http://localhost:8080/api/incidencias/tecnico/${tecnicoId}`);

        if (!response.ok) {
        throw new Error("Error al obtener incidencias del técnico");
        }

        return await response.json();
    },

    crearIncidencia: async ({ direccion, latitud, longitud, descripcion, ciudadanoId }) => {
        const response = await fetch("http://localhost:8080/api/incidencias", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            direccion,
            latitud,
            longitud,
            descripcion,
            ciudadanoId,
        }),
        });

        if (!response.ok) {
        throw new Error("Error al crear la incidencia");
        }

        return await response.json();
     },

    actualizarIncidencia: async (id, { direccion, latitud, longitud, descripcion }) => {
        const response = await fetch(`http://localhost:8080/api/incidencias/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
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

    cambiarEstadoIncidencia: async (id, nuevoEstado) => {
        const response = await fetch(
        `http://localhost:8080/api/incidencias/${id}/estado?nuevoEstado=${nuevoEstado}`,
        {
            method: "PUT",
        }
        );

        if (!response.ok) {
        throw new Error("Error al cambiar el estado");
        }

        return await response.json();
    },

    cambiarPrioridadIncidencia: async (id, prioridad) => {
        const response = await fetch(
        `http://localhost:8080/api/incidencias/${id}/prioridad?prioridad=${prioridad}`,
        {
            method: "PUT",
        }
        );

        if (!response.ok) {
        throw new Error("Error al cambiar la prioridad");
        }

        return await response.json();
    },

    asignarOperadorIncidencia: async (id, operadorId) => {
        const response = await fetch(
        `http://localhost:8080/api/incidencias/${id}/operador/${operadorId}`,
        {
            method: "PUT",
        }
        );

        if (!response.ok) {
        throw new Error("Error al asignar operador");
        }

        return await response.json();
    },

    asignarTecnicoIncidencia: async (id, tecnicoId) => {
        const response = await fetch(
        `http://localhost:8080/api/incidencias/${id}/tecnico/${tecnicoId}`,
        {
            method: "PUT",
        }
        );

        if (!response.ok) {
        throw new Error("Error al asignar técnico");
        }

        return await response.json();
    },

    eliminarTecnicoIncidencia: async (id, tecnicoId) => {
        const response = await fetch(
        `http://localhost:8080/api/incidencias/${id}/tecnico/${tecnicoId}`,
        {
            method: "DELETE",
        }
        );

        if (!response.ok) {
        throw new Error("Error al eliminar técnico");
        }

        return await response.json();
    },

    eliminarIncidencia: async (id) => {
        const response = await fetch(`http://localhost:8080/api/incidencias/${id}`, {
        method: "DELETE",
        });

        if (!response.ok) {
        throw new Error("Error al eliminar incidencia");
        }

        return true;
    },


}