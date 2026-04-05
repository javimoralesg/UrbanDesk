import { useEffect } from "react";
import "../assets/css/MediaPopup.css";

export default function MediaPopup({ isOpen, media, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !media) return null;

  const esVideo =
    media.type?.startsWith("video/") ||
    /\.(mp4|webm|ogg|mov)$/i.test(media.src || "");

  const esImagen =
    media.type?.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(media.src || "");

  return (
    <div className="media-popup__overlay" onClick={onClose}>
      <div
        className="media-popup__content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="media-popup__close"
          onClick={onClose}
          aria-label="Cerrar ventana"
        >
          ×
        </button>

        {esImagen && (
          <img
            src={media.src}
            alt={media.alt || "Evidencia ampliada"}
            className="media-popup__media media-popup__media--image"
          />
        )}

        {esVideo && (
          <video
            src={media.src}
            controls
            autoPlay
            className="media-popup__media media-popup__media--video"
          />
        )}
      </div>
    </div>
  );
}