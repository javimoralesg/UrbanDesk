import { useState, useEffect } from 'react';
import { useReactMediaRecorder } from "react-media-recorder";
import { api } from "../services/api";
import Popups from './Popups';

export default function Recording({ setDescripcion, handleInputChange }) {
    const [recordingTime, setRecordingTime] = useState(0);
    const [processingMessage, setProcessingMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [incidenceList, setIncidenceList] = useState([]);

    const showError = (msg) => {
        setIncidenceList([{ message: msg, type: 'error' }]);
        setTimeout(() => setIncidenceList([]), 5000);
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        });
    };

    const processAudio = async (blob) => {
        setIsProcessing(true);
        setProcessingMessage("Iniciando...");

        try {
            const audioBase64 = await blobToBase64(blob);

            const response = await api.transcribeAndProcessAudio(audioBase64);

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split("\n");
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);

                        if (data.status === "processing") {
                            setProcessingMessage(data.message || "Procesando...");
                        } else if (data.status === "success") {
                            setProcessingMessage("¡Completado!");

                            try {
                                const parsedReply = JSON.parse(data.reply);
                                setDescripcion(parsedReply.descripcion);
                                if (parsedReply.ubicacion.trim() !== '') {
                                    handleInputChange(parsedReply.ubicacion);
                                }
                            } catch (e) {
                                showError("Error al procesar la transcripción");
                                console.error("Error parsing reply:", e);
                            }

                        } else if (data.status === "error") {
                            console.error("Error backend:", data.message);
                            showError("Error: " + data.message);
                        }
                    } catch (e) {
                        console.error("Error parseando línea NDJSON:", e);
                        showError("Error al procesar la transcripción");
                    }
                }
            }

        } catch (error) {
            console.error("Error enviando audio:", error);
            showError("Error de conexión");
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
        }
    };

    const { status, startRecording, stopRecording, error: recordingError } = useReactMediaRecorder({
        audio: true,
        askPermissionOnMount: false,
        stopStreamsOnStop: true,
        onStop: (blobUrl, blob) => {
            if (blob) {
                processAudio(blob);
            } else {
                console.error("Blob is null or undefined");
            }
        }
    });

    useEffect(() => {
        if (recordingError) {
            if (recordingError === 'permission_denied' || recordingError === 'not_allowed_error' || recordingError === 'NotFoundError') {
                showError("Aceso a micrófono denegado o no encontrado.");
            } else {
                showError("Error al acceder al micrófono");
            }
        }
    }, [recordingError]);

    useEffect(() => {
        let interval;
        if (status === "recording") {
            setRecordingTime(0);
            interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [status]);

    const toggleRecording = () => {
        if (isProcessing) return;
        if (status === "recording") {
            stopRecording();
        } else {
            try {
                startRecording();
            } catch (err) {
                showError("Error al iniciar el micrófono.");
            }
        }
    };

    return (
        <>
            <Popups list={incidenceList} />
            <div
                onClick={toggleRecording}
                className={`recording-button ${status === 'recording' ? 'is-recording' : ''} ${isProcessing ? 'is-processing' : ''}`}
                style={{
                    cursor: isProcessing ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    minWidth: '100px',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor:
                        status === 'recording'
                            ? '#ff4d4d'
                            : isProcessing
                                ? '#eee'
                                : '#1ac2ff84',
                    color: status === 'recording' ? 'white' : '#333',
                    border: 'none',
                    marginBottom: '10px',
                    height: '37px',
                }}
            >
                {status === "recording" ? (
                    <>
                        <span className="recording-time" style={{ fontWeight: 'bold' }}>{recordingTime}s</span>
                        <span role="img" aria-label="stop" style={{ fontSize: '20px', color: 'red', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <img src="/stopRec.png" alt="Stop" style={{ width: '26px', height: '26px' }} />
                        </span>
                    </>
                ) : isProcessing ? (
                    <span className="processing-message" style={{ fontSize: '0.9rem' }}>{processingMessage}</span>
                ) : (
                    <span role="img" aria-label="microphone" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '5px', color: 'black', fontWeight: 'bold' }}>
                        <img src="/ai.png" alt="Record" style={{ width: '50px', height: '50px' }} />
                        Generar incidencia mediante voz
                    </span>
                )}
            </div>
        </>
    );
}
