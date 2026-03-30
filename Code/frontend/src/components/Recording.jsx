import { useState, useEffect } from 'react';
import { useReactMediaRecorder } from "react-media-recorder";
import PermissionPopup from './PermissionPopup';
import { api } from "../services/api";

export default function Recording({ setDescripcion, handleInputChange }) {
    const [recordingTime, setRecordingTime] = useState(0);
    const [permissionError, setPermissionError] = useState(null);
    const [processingMessage, setProcessingMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

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
                                console.error("Error parsing reply:", e);
                            }

                        } else if (data.status === "error") {
                            console.error("Error backend:", data.message);
                            setError(data.message);
                            setProcessingMessage("Error: " + data.message);
                        }
                    } catch (e) {
                        console.error("Error parseando línea NDJSON:", e);
                        setError(e.message);
                    }
                }
            }

        } catch (error) {
            console.error("Error enviando audio:", error);
            setProcessingMessage("Error de conexión");
            setError(error.message);
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
                setPermissionError("Microphone access denied or not found.");
            } else {
                setPermissionError("Error accessing microphone.");
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
        setPermissionError(null);
        if (status === "recording") {
            stopRecording();
        } else {
            try {
                startRecording();
            } catch (err) {
                setPermissionError("Error starting microphone.");
            }
        }
    };

    return (
        <>
            {error && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                    {error}
                </div>
            )}
            <div
                onClick={toggleRecording}
                className={`recording-button ${status === 'recording' ? 'is-recording' : ''} ${isProcessing ? 'is-processing' : ''}`}
                style={{ cursor: isProcessing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '100px', padding: '10px', borderRadius: '5px', backgroundColor: status === 'recording' ? '#ff4d4d' : '#eee', color: status === 'recording' ? 'white' : '#333', border: 'none', marginBottom: '10px', height: '37px' }}
            >
                {status === "recording" ? (
                    <>
                        <span className="recording-time" style={{ fontWeight: 'bold' }}>{recordingTime}s</span>
                        <span role="img" aria-label="stop" style={{ fontSize: '20px', color: 'red' }}>⏹️</span>
                    </>
                ) : isProcessing ? (
                    <span className="processing-message" style={{ fontSize: '0.9rem' }}>{processingMessage}</span>
                ) : (
                    <span role="img" aria-label="microphone" style={{ fontSize: '24px' }}>🎤</span>
                )}
            </div>
            {permissionError && (
                <PermissionPopup
                    message={permissionError}
                    onClose={() => setPermissionError(null)}
                />
            )}
        </>
    );
}
