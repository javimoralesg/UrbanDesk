import { useState, useEffect } from 'react'

export default function HomeBase() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const iframeStyle = { width: '100%', height: '100vh', border: 'none' };

    return (
        <div>
            <iframe
                title="HomeBase-Mayor"
                src="../../../public/WebsAytoMadrid/Mayor.html"
                style={{ ...iframeStyle, display: windowWidth >= 991 ? 'block' : 'none' }}
            />
            <iframe
                title="HomeBase-Mediano"
                src="../../../public/WebsAytoMadrid/Mediano.html"
                style={{ ...iframeStyle, display: windowWidth >= 768 && windowWidth < 991 ? 'block' : 'none' }}
            />
            <iframe
                title="HomeBase-Pequeño"
                src="../../../public/WebsAytoMadrid/Pequeño.html"
                style={{ ...iframeStyle, display: windowWidth < 768 ? 'block' : 'none' }}
            />
        </div>
    );        
}