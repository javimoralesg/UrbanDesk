import { useEffect, useMemo, useRef, useState } from "react";
import Markdown from "markdown-to-jsx";
import { api } from "../services/api";
import "../assets/css/ChatbotInforme.css";

const buildWelcomeMessage = (hasReport) => {
	if (hasReport) {
		return "¡Hola! Ya tengo el informe cargado. Puedes preguntarme cualquier duda y te responderé en tiempo real.";
	}

	return "¡Hola! Soy tu asistente inteligente. Genera un informe y después podré responder preguntas sobre sus datos y conclusiones.";
};

const mkId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function ChatbotInforme({ informe, datos, disabled = false, onError }) {
	const [input, setInput] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [messages, setMessages] = useState(() => [
		{
			id: mkId("welcome"),
			role: "assistant",
			content: buildWelcomeMessage(false),
			sendToModel: false
		}
	]);

	const messagesRef = useRef(null);
	const textareaRef = useRef(null);

	const hasReport = Boolean(informe);

	useEffect(() => {
		setMessages([
			{
				id: mkId("welcome"),
				role: "assistant",
				content: buildWelcomeMessage(hasReport),
				sendToModel: false
			}
		]);
		setInput("");
		setIsStreaming(false);
	}, [hasReport, informe]);

	useEffect(() => {
		const container = messagesRef.current;
		if (!container) return;

		container.scrollTo({
			top: container.scrollHeight,
			behavior: "smooth"
		});
	}, [messages, isStreaming]);

	useEffect(() => {
		const el = textareaRef.current;
		if (!el) return;

		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	}, [input]);

	const historyForModel = useMemo(() => {
		return messages
			.filter((m) => m.sendToModel)
			.map((m) => ({ role: m.role, content: String(m.content || "") }));
	}, [messages]);

	const emitError = (message) => {
		if (typeof onError === "function") {
			onError(message);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const question = input.trim();
		if (!question || isStreaming || disabled) return;

		if (!hasReport) {
			emitError("Primero genera un informe para poder usar este chat.");
			return;
		}

		const userId = mkId("u");
		const assistantId = mkId("a");
		const previousHistory = [...historyForModel];

		setInput("");
		setMessages((prev) => [
			...prev,
			{ id: userId, role: "user", content: question, sendToModel: true },
			{ id: assistantId, role: "assistant", content: "", sendToModel: true, streaming: true }
		]);
		setIsStreaming(true);

		try {
			const result = await api.askReportChatStream({
				question,
				informe,
				datos,
				history: previousHistory,
				onDelta: (delta) => {
					const chunk = String(delta || "");
					if (!chunk) return;

					setMessages((prev) =>
						prev.map((message) =>
							message.id === assistantId
								? { ...message, content: `${message.content}${chunk}` }
								: message
						)
					);
				}
			});

			setMessages((prev) =>
				prev.map((message) => {
					if (message.id !== assistantId) return message;

					const fallback = String(result?.reply || "");
					const finalContent = message.content || fallback || "No se pudo generar respuesta.";

					return { ...message, content: finalContent, streaming: false };
				})
			);
		} catch (error) {
			const msg = error?.message || "No se pudo responder en este momento.";
			emitError(msg);

			setMessages((prev) =>
				prev.map((message) =>
					message.id === assistantId
						? {
							...message,
							content: "No he podido responder ahora mismo. Intenta de nuevo en unos segundos.",
							streaming: false
						}
						: message
				)
			);
		} finally {
			setIsStreaming(false);
		}
	};

	return (
		<div className="generar-informe__left-column">
			<div className="generar-informe__card">
				<h3 className="generar-informe__section-title">Chat del informe</h3>
				<div className="chatbot-informe">

					<div ref={messagesRef} className="chatbot-informe__messages" aria-live="polite">
						{messages.map((message) => (
							message.streaming ? (
								message.content ? (
								<article
									key={message.id}
									className={`chatbot-informe__bubble chatbot-informe__bubble--assistant chatbot-informe__bubble--streaming`}
								>
									<Markdown>{String(message.content || "")}</Markdown>
									<span className="chatbot-informe__cursor" />
								</article>
								) : null
							) : (
								<article
									key={message.id}
									className={`chatbot-informe__bubble ${message.role === "user" ? "chatbot-informe__bubble--user" : "chatbot-informe__bubble--assistant"}`}
								>
									{message.role === "assistant" ? (
										<Markdown>{String(message.content || "")}</Markdown>
									) : (
										<p>{message.content}</p>
									)}
								</article>
							)
						))}

						{isStreaming && messages.some(m => m.streaming && !m.content) && (
							<div className="chatbot-informe__typing" aria-hidden="true">
								<span />
								<span />
								<span />
							</div>
						)}

					</div>

					<form className="chatbot-informe__composer" onSubmit={handleSubmit}>
						<textarea
							ref={textareaRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={hasReport ? "Escribe tu mensaje aquí..." : "Genera un informe para empezar..."}
							rows={2}
							disabled={disabled || isStreaming}
						/>

						<button type="submit" disabled={!input.trim() || disabled || isStreaming || !hasReport} aria-label="Enviar pregunta" className="btn-send btn-send--circle">
							<img src="/send.png" alt="Enviar" />
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
