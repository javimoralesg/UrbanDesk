import { useLocation, Link } from "react-router";
import "../css/Hero.css";

export default function Hero() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div>
      <header className="heroContent">
        <div className="heroOverlay">
          <div className="heroText">
            <p className="portal">Portal web del Ayuntamiento</p>
            <img src="/completeLogo.png" alt="Ayuntamiento" className="ayuntamientoLogo" />
          </div>
        </div>
        <img src="/incidenciasUrbanas.png" alt="Incidencias Urbanas" className="back" />
      </header>
      <div className="heroBottom">
        <p className="heroBottomText">
          <Link to="/">
            <svg xmlns="http://www.w3.org/2000/svg" style={{display: 'flex', paddingBottom: '2px'}} width="16" height="16" fill="currentColor" className="bi bi-house-door-fill" viewBox="0 0 16 16">
              <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5Z"/>
            </svg>
          </Link>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            return (
              <span key={name} className="breadcrumb-part">
                <span className="breadcrumb-separator">/</span>
                {isLast ? (
                  <span className="breadcrumb-current">{name}</span>
                ) : (
                  <Link to={routeTo}>{name}</Link>
                )}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}