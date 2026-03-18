import Hero from '../assets/components/Hero';
import Sidebar from '../assets/components/Sidebar';

import '../assets/css/Home.css';

export default function Home() {
  return (
    <div className="urban-home">
      <Hero />
      <main className="urban-home__layout">
        <Sidebar />
      </main>
    </div>
  );
}