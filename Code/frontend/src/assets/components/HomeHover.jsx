import { useState, useEffect } from 'react'
import { Link } from 'react-router'

import megaphone from '../../../public/websAytoMadrid/megaphone.png';
import '../css/HomeHover.css';


export default function HomeHover() {

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div> 
            <div className="home-hover-main" style={{ display: windowWidth >= 768 ? '' : 'none' }}>
                <div className="home-hover">
                    <div className="home-hover-content">
                        <Link to="/incidencias-urbanas" >
                            <div className="item" >
                                <img src={megaphone} />
                                Incidencias urbanas
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="home-hover-main-peque" style={{ display: windowWidth < 768 ? '' : 'none' }}>
                <div className="home-hover-peque">
                    <div className="home-hover-content-peque">
                        <Link to="/incidencias-urbanas" >
                            <div className="item-peque" >
                                <img src={megaphone} />
                                Incidencias urbanas
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}