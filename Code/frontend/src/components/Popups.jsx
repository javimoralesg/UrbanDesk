import { useState, useEffect } from "react";
import "../assets/css/Popups.css";

export default function Popups({ list }) {
    const [topPosition, setTopPosition] = useState(340);

    const theme = {
        success: { bg: "#EDF7ED", border: "#4CAF50", text: "#1E4620" },
        error: { bg: "#FDEDED", border: "#F44336", text: "#5F2120" },
        waiting: { bg: "#E5F6FD", border: "#2196F3", text: "#014361" }
    };

    const emoji = {
        success: "",
        error: <img src="/warning.png" alt="Error" style={{ width: '25px', height: '25px' }} />,
        waiting: <span className="spinner" style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(30, 58, 138, 0.2)',
            borderTop: '2px solid #1e3a8a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
        }} />
    };

    useEffect(() => {
        const updatePosition = () => {
            const sidebar = document.querySelector('.urban-sidebar__nav--open');
            const scrollY = window.scrollY;
            let baseTop = window.innerWidth > 640 ? 260 : 340;
            if (sidebar) {
                baseTop = 340
                const sidebarRect = sidebar.getBoundingClientRect();
                const sidebarBottom = sidebarRect.top + scrollY + sidebarRect.height;
                baseTop = sidebarBottom + 20;
            }
            const minTop = 20;
            const top = Math.max(minTop, baseTop - scrollY);
            setTopPosition(top);
        };

        window.addEventListener("scroll", updatePosition);
        window.addEventListener("resize", updatePosition);

        const observer = new MutationObserver(() => {
            updatePosition();
        });

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class']
        });

        updatePosition();

        return () => {
            window.removeEventListener("scroll", updatePosition);
            window.removeEventListener("resize", updatePosition);
            observer.disconnect();
        };
    }, []);

    return (
        <div
            id="popup-container"
            style={{
                top: `${topPosition}px`
            }}
        >
            {list.map((popup, index) => (
                <div
                    key={index}
                    className="popup"
                    style={{
                        border: `2px solid ${theme[popup.type].border}`,
                        backgroundColor: theme[popup.type].bg,
                        color: theme[popup.type].text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5em',
                        minHeight: '40px'
                    }}
                >
                            <span style={{ display: 'flex', alignItems: 'center' }}>{emoji[popup.type]}</span>
                    <span style={{ display: 'flex', alignItems: 'center' }}>{popup.message}</span>
                    {popup.onAccept && popup.onCancel && (
                        <div className="popup-actions">
                            <button className="popup-button popup-button--cancel" onClick={popup.onCancel}>
                                {popup.cancelText || 'Cancelar'}
                            </button>
                            <button className="popup-button popup-button--accept" onClick={popup.onAccept}>
                                {popup.acceptText || 'Aceptar'}
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}