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
import Login from './Login';
import Register from './Register';
import Profile from './Profile';
import SecondMint from './SecondMint';
import NFTUpload from './NFTUpload';

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
            <Route path="/NFTUpload" element={<NFTUpload />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/protected" element={<ProtectedComponent />} />
            <Route path="/profile" element={<Profile />} />
            </Routes>
            <SecondMint accounts={accounts} setAccounts={setAccounts}/>
            <OurStory/>
            <NFTListings/>    
          </div>
        <div className='moving-background'></div>
      </div>
    </Router>
  );
}

const ProtectedComponent = () => {
  return <h1>Protected Route - Access Granted</h1>;
};

export default App;
