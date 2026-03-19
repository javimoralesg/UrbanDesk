import HomeBase from '../assets/components/HomeBase';
import HomeHover from '../assets/components/HomeHover';
import '../assets/css/Home.css';

export default function Home() {
  return (
    <div className="page-home">
        <HomeHover />
        <div className='blackout'></div>
        <HomeBase />
    </div>
  );
}