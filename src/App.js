import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import MainMint from './MainMint';
import NavBar from './NavBar';
import Footer from './footer';
import './styles.css';
import OurStory from './OurStory';
import MintSettings from './MintSettings';


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
            </Routes>
            <OurStory/>
            <Footer/>             
          </div>
        <div className='moving-background'></div>
      </div>
    </Router>
  );
}

export default App;
