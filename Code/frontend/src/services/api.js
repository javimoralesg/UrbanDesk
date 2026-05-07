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
        const rawText = await response.text();
        if (rawText) {
            const data = JSON.parse(rawText);
            message =
                data?.message ||
                data?.detail ||
                (data?.error && data?.error !== "Bad Request" ? data.error : null) ||
                data?.title ||
                data?.error ||
                rawText ||
                message;
        } else {
            message = response.statusText || message;
        }
    } catch {
        console.error("Error al parsear el mensaje de error:", response.status);
        message = response.statusText || message;
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

    deleteAccount: async () => {
        resetInactivityTimer();

        const response = await fetch(`${BASE_URL}/usuarios/perfil`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error al eliminar la cuenta');
        }
    },

    getIncidents: async () => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/incidencias`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return parseJsonOrThrow(response);
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

    generateReport: async (userMessage, onProgress) => {
        resetInactivityTimer();
        const response = await fetch("https://urbandeskinforme-g475okyxfq-uc.a.run.app", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth': import.meta.env.VITE_IA_API_KEY
            },
            body: JSON.stringify({ userMessage }),
        });

        if (!response.body) {
            return parseJsonOrThrow(response);
        }

        if (!response.ok) {
            const text = await response.text();
            try {
                const parsed = JSON.parse(text);
                throw new Error(parsed?.message || parsed?.error || `Error ${response.status}`);
            } catch {
                throw new Error(text || `Error ${response.status}`);
            }
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalPayload = null;

        const handleLine = (line) => {
            if (!line.trim()) return;

            let chunk;
            try {
                chunk = JSON.parse(line);
            } catch {
                return;
            }

            if (chunk.status === "processing") {
                if (typeof onProgress === "function") {
                    onProgress(chunk);
                }
                return;
            }

            if (chunk.status === "error") {
                throw new Error(chunk.message || chunk.details || "Error al generar informe");
            }

            if (chunk.status === "success") {
                finalPayload = {
                    informe: chunk.informe,
                    datos: chunk.datos
                };
            }
        };

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                handleLine(line);
            }
        }

        buffer += decoder.decode();
        if (buffer.trim()) {
            handleLine(buffer);
        }

        if (finalPayload) {
            return finalPayload;
        }

        throw new Error("No se recibió respuesta final del generador de informes.");
    },

    askReportChatStream: async ({ question, informe, datos, history = [], onDelta, onStart }) => {
        resetInactivityTimer();

        const response = await fetch("https://urbandeskinformechat-g475okyxfq-uc.a.run.app", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth": import.meta.env.VITE_IA_API_KEY
            },
            body: JSON.stringify({ question, informe, datos, history, stream: true })
        });

        if (!response.body) {
            return parseJsonOrThrow(response);
        }

        if (!response.ok) {
            const text = await response.text();
            try {
                const parsed = JSON.parse(text);
                throw new Error(parsed?.message || parsed?.error || `Error ${response.status}`);
            } catch {
                throw new Error(text || `Error ${response.status}`);
            }
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalPayload = null;

        const handleLine = (line) => {
            if (!line.trim()) return;

            let chunk;
            try {
                chunk = JSON.parse(line);
            } catch {
                return;
            }

            if (chunk.status === "start") {
                if (typeof onStart === "function") onStart(chunk);
                return;
            }

            if (chunk.status === "delta") {
                if (typeof onDelta === "function") {
                    onDelta(String(chunk.delta || ""), chunk);
                }
                return;
            }

            if (chunk.status === "error") {
                throw new Error(chunk.message || chunk.details || "Error al responder en el chat");
            }

            if (chunk.status === "success") {
                finalPayload = {
                    reply: chunk.reply,
                    modelUsed: chunk.modelUsed
                };
            }
        };

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                handleLine(line);
            }
        }

        buffer += decoder.decode();
        if (buffer.trim()) {
            handleLine(buffer);
        }

        if (finalPayload) {
            return finalPayload;
        }

        throw new Error("No se recibió respuesta final del chat de informe.");
    },

    recuperarCuenta: async (email) => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/tokens/recuperar-cuenta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        return parseJsonOrThrow(response);
    },

    restablecerCuenta: async (token, password) => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/tokens/restablecer-cuenta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, password }),
        });
        return parseJsonOrThrow(response);
    },

    validarCuenta: async (token) => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/tokens/validar-cuenta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });
        return parseJsonOrThrow(response);
    },

    buscarIncidenciasCercanas: async ({ latitud, longitud, rangoKm }) => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/incidencias/buscar-cercanas?latitud=${latitud}&longitud=${longitud}&rangoKm=${rangoKm}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return parseJsonOrThrow(response);
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

    obtenerIncidenciaPublicaPorId: async (id) => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/incidencias/publicas/${id}`, {
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

        return parseJsonOrThrow(response);
    },

    actualizarIncidencia: async (id,
    {
        direccion,
        latitud,
        longitud,
        descripcion,
        imagenesNuevas,
        imagenesExistentes
    }
) => {
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
            imagenesNuevas,      
            imagenesExistentes   
        }),
    });

    return parseJsonOrThrow(response);
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

    asignarTecnicoPorEspecialidadIncidencia: async (id, especialidad) => {
        resetInactivityTimer();
        const response = await fetch(
            `${BASE_URL}/incidencias/${id}/tecnico?especialidad=${encodeURIComponent(especialidad)}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error("Error al asignar técnico por especialidad");
        }

        return await response.json();
    },

    actualizarTecnicosPorEspecialidadesIncidencia: async (id, especialidades = []) => {
        resetInactivityTimer();
        const response = await fetch(
            `${BASE_URL}/incidencias/${id}/tecnicos/especialidades`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({ especialidades }),
            }
        );

        return parseJsonOrThrow(response);
    },

    eliminarTecnicoPorEspecialidadIncidencia: async (id, especialidad) => {
        resetInactivityTimer();
        const response = await fetch(
            `${BASE_URL}/incidencias/${id}/tecnico?especialidad=${encodeURIComponent(especialidad)}`,
            {
                method: "DELETE",
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error("Error al eliminar técnico por especialidad");
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

    aceptarIncidenciaTecnico: async (id, tecnicoId) => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/incidencias/${id}/aceptar/${tecnicoId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error("Error al aceptar la incidencia");
        }

        return await response.json();
    },

    rechazarIncidenciaTecnico: async (id, tecnicoId, motivo) => {
        resetInactivityTimer();
        const url = new URL(`${BASE_URL}/incidencias/${id}/rechazar/${tecnicoId}`);
            url.searchParams.append("comentario", motivo);  

        const response = await fetch(url.toString(), {
            method: "DELETE",
            headers: getAuthHeaders(), 
        });

        if (!response.ok) {
            throw new Error("Error al rechazar la incidencia");
        }

        return await response.json();
    }, 
    resolverIncidenciaTecnico: async (id, tecnicoId, comentario) => {
        const response = await fetch(
            `${BASE_URL}/incidencias/${id}/tecnico/${tecnicoId}/resolver?comentario=${encodeURIComponent(comentario)}`,
            { method: "PUT", headers: getAuthHeaders() }
        );
        if (!response.ok) throw new Error("Error al resolver la incidencia");
        return await response.json();
    },
    obtenerIncidenciasPublicas: async () => {
        resetInactivityTimer();

        const response = await fetch(`${BASE_URL}/incidencias/publicas`, {
            method: 'GET',
            credentials: 'omit',
        });

        return parseJsonOrThrow(response);
    },

    cerrarIncindencia: async (id, comentarioTecnico = "") => {
        resetInactivityTimer();
        const response = await fetch(`${BASE_URL}/incidencias/${id}/cerrar`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ comentarioTecnico }),
        });

        if (!response.ok) {
            throw new Error("Error al cerrar la incidencia");
        }

        return await response.json();
    },
};