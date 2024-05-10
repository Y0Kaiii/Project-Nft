import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import MainMint from './MainMint';
import NavBar from './NavBar';
import Footer from './footer';
import './styles.css';
import ExploreMore from './ExploreMore';
import OurStory from './OurStory';
import MintSettings from './MintSettings';
import FAQ from './FAQ';
import Followus from './Followus';
import NFTListings from './NFTListings';
import CollectionCarousel from './CollectionCarolsel';
import CitiesIntro from './CitiesIntro';
import MisterTelThai from './MisterTelThai';
import Logs from './Logs';


function App() {
  const [accounts, setAccounts] = useState([]);
  return (
    <Router>
      <div className='overlay'>
        <div className="App">
          <NavBar accounts={accounts} setAccounts={setAccounts} />
            <Routes>
            <Route path="/" element={<MainMint accounts={accounts} setAccounts={setAccounts} />} />
            <Route path="/mint-settings" element={<MintSettings />} />
            <Route path="/logs" element={<Logs />} />
            </Routes>
            <CollectionCarousel/>
            <OurStory/>
            <NFTListings/>    
            <CitiesIntro/>   
            <MisterTelThai/> 
            <FAQ/>
            <Followus/>
            <Footer/>             
          </div>
        <div className='moving-background'></div>
      </div>
    </Router>
  );
}

export default App;
