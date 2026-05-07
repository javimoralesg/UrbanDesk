import { useState, useRef, useEffect } from 'react';
import "../assets/css/PoliticaPrivacidad.css";

export default function PrivacyPolicyModal({ isOpen, onClose, onAccept, onScrolledToEnd, hasScrolledToEnd }) {
  const contentRef = useRef(null);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isAtEnd = scrollHeight - (scrollTop + clientHeight) < 10;
      if (isAtEnd && onScrolledToEnd) {
        onScrolledToEnd(true);
      }
    }
  };

  const handleAccept = () => {
    if (hasScrolledToEnd) {
      onAccept();
    }
  };

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="privacy-modal__overlay" onClick={onClose}>
      <div className="privacy-modal__container" onClick={(e) => e.stopPropagation()}>
        <div className="privacy-modal__header">
          <h2>Política de Privacidad y Protección de Datos</h2>
          <button
            className="privacy-modal__close"
            onClick={onClose}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div
          className="privacy-modal__content"
          ref={contentRef}
          onScroll={handleScroll}
        >
          <section className="privacy-modal__section">
            <h3>Política de Privacidad</h3>
            <p>
              En UrbanDesk, nos comprometemos a proteger su privacidad y a garantizar que sus datos personales sean tratados de manera segura y conforme a la legislación aplicable.
            </p>
            <p>
              Esta política describe cómo recopilamos, utilizamos y protegemos su información personal cuando utiliza nuestros servicios.
            </p>
          </section>

          <section className="privacy-modal__section">
            <h3>Protección de Datos</h3>
            <p>
              Cumplimos con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD) en el tratamiento de sus datos personales.
            </p>
            <h4>Derechos de los Usuarios</h4>
            <ul>
              <li>Derecho de acceso: Puede solicitar información sobre los datos personales que tenemos sobre usted.</li>
              <li>Derecho de rectificación: Puede corregir o actualizar sus datos personales.</li>
              <li>Derecho de supresión: Puede solicitar la eliminación de sus datos personales.</li>
              <li>Derecho a la portabilidad: Puede obtener una copia de sus datos en un formato estructurado.</li>
              <li>Derecho de oposición: Puede oponerse al tratamiento de sus datos en ciertas circunstancias.</li>
            </ul>
          </section>

          <section className="privacy-modal__section">
            <h3>Recopilación de Datos</h3>
            <p>
              Recopilamos los siguientes tipos de información:
            </p>
            <ul>
              <li>Información de registro: nombre, email, código postal.</li>
              <li>Información de uso: interacciones con la plataforma.</li>
              <li>Información técnica: dirección IP, tipo de navegador, etc.</li>
            </ul>
          </section>

          <section className="privacy-modal__section">
            <h3>Uso de los Datos</h3>
            <p>
              Utilizamos sus datos para:
            </p>
            <ul>
              <li>Proporcionar y mejorar nuestros servicios.</li>
              <li>Comunicarnos con usted sobre su cuenta y nuestros servicios.</li>
              <li>Cumplir con obligaciones legales.</li>
            </ul>
          </section>

          <section className="privacy-modal__section">
            <h3>Seguridad de los Datos</h3>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra acceso no autorizado, alteración, divulgación o destrucción.
            </p>
            <p>
              Sin embargo, no podemos garantizar la seguridad absoluta de la transmisión de datos a través de Internet.
            </p>
          </section>

          <section className="privacy-modal__section">
            <h3>Retención de Datos</h3>
            <p>
              Conservamos sus datos personales durante el tiempo necesario para cumplir con los fines para los que fueron recopilados o conforme a la ley aplicable.
            </p>
          </section>

          <section className="privacy-modal__section">
            <h3>Cookies y Tecnologías Similares</h3>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web. Puede controlar el uso de cookies a través de la configuración de su navegador.
            </p>
          </section>

          <section className="privacy-modal__section">
            <h3>Cambios en esta Política</h3>
            <p>
              Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Los cambios serán efectivos cuando se publiquen en nuestro sitio web.
            </p>
          </section>

          <section className="privacy-modal__section">
            <h3>Contacto</h3>
            <p>
              Si tiene preguntas sobre esta política o desea ejercer sus derechos, puede contactarnos en: <strong>urbandesk@javimoralesg.com</strong>
            </p>
          </section>
        </div>

        <div className={`privacy-modal__footer ${hasScrolledToEnd ? 'hidden' : 'visible'}`}>
          <p className={`privacy-modal__scroll-message ${hasScrolledToEnd ? 'hidden' : 'visible'}`}>
            Por favor, léalo hasta el final para continuar
          </p>
        </div>
      </div>
    </div>
  );
}
