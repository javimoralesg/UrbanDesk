


export const api = {
    // funciones asíncronas que se usan en los jsx y que hacen las peticiones al backend





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

}