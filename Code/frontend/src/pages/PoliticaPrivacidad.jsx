import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import "../assets/css/PoliticaPrivacidad.css";

export default function PoliticaPrivacidad() {
  return (
    <div className="politica-privacidad">
      <Hero />
      <div className="politica-privacidad__layout">
        <Sidebar />
        <main className="politica-privacidad__content">
          <h1 className="politica-privacidad__title">Política de Privacidad y Protección de Datos</h1>

          <section className="politica-privacidad__section">
            <h2>Política de Privacidad</h2>
            <p>
              En UrbanDesk, nos comprometemos a proteger su privacidad y a garantizar que sus datos personales sean tratados de manera segura y conforme a la legislación aplicable.
            </p>
            <p>
              Esta política describe cómo recopilamos, utilizamos y protegemos su información personal cuando utiliza nuestros servicios.
            </p>
          </section>

          <section className="politica-privacidad__section">
            <h2>Protección de Datos</h2>
            <p>
              Cumplimos con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD) en el tratamiento de sus datos personales.
            </p>
            <h3>Derechos de los Usuarios</h3>
            <ul>
              <li>Derecho de acceso: Puede solicitar información sobre los datos personales que tenemos sobre usted.</li>
              <li>Derecho de rectificación: Puede corregir o actualizar sus datos personales.</li>
              <li>Derecho de supresión: Puede solicitar la eliminación de sus datos personales.</li>
              <li>Derecho a la portabilidad: Puede obtener una copia de sus datos en un formato estructurado.</li>
              <li>Derecho de oposición: Puede oponerse al tratamiento de sus datos en ciertas circunstancias.</li>
            </ul>
          </section>

          <section className="politica-privacidad__section">
            <h2>Recopilación de Datos</h2>
            <p>
              Recopilamos los siguientes tipos de información:
            </p>
            <ul>
              <li>Información de registro: nombre, email, código postal.</li>
              <li>Información de uso: interacciones con la plataforma.</li>
              <li>Información técnica: dirección IP, tipo de navegador, etc.</li>
            </ul>
          </section>

          <section className="politica-privacidad__section">
            <h2>Uso de los Datos</h2>
            <p>
              Utilizamos sus datos para:
            </p>
            <ul>
              <li>Proporcionar y mejorar nuestros servicios.</li>
              <li>Comunicarnos con usted sobre su cuenta y nuestros servicios.</li>
              <li>Cumplir con obligaciones legales.</li>
            </ul>
          </section>

          <section className="politica-privacidad__section">
            <h2>Contacto</h2>
            <p>
              Si tiene preguntas sobre esta política o desea ejercer sus derechos, puede contactarnos en: privacidad@urbandesk.com
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}