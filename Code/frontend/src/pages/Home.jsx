import HomeHero from '../assets/components/home/HomeHero';
import HomeBreadcrumb from '../assets/components/home/HomeBreadcrumb';
import HomeSidebar from '../assets/components/home/HomeSidebar';
import HomeContent from '../assets/components/home/HomeContent';

import '../assets/css/Home.css';

export default function Home() {
  return (
    <div className="urban-home">
      <HomeHero />
      <HomeBreadcrumb />
      <main className="urban-home__layout">
        <HomeSidebar />
        <HomeContent />
      </main>
    </div>
  );
}