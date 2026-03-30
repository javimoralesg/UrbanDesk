import HomeBase from '../components/HomeBase';
import HomeHover from '../components/HomeHover';
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