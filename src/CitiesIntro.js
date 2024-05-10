// CitySelector.js
import React, { useState } from 'react';
import './styles.css';
import cityIcon1 from './assets/images/city-icon-1.png';
import cityIcon2 from './assets/images/city-icon-2.png';
import cityIcon3 from './assets/images/city-icon-3.png';

const CitiesIntro = () => {
  const [selectedCity, setSelectedCity] = useState(0);

  const cityNames = ['TaiKong SamudSakorn', 'Potara Dock', 'Vajira Hospital'];
  const cityIcons = [cityIcon1, cityIcon2, cityIcon3];

  const updateCity = (index) => {
    setSelectedCity(index);
  };

  return (
    <div className="city-container">
      <div className="city-left-section">
        <p>Cities</p>
        <p>Introduction</p>
      </div>
      <div className="city-middle-section">
        <img
          id="cityIcon"
          src={cityIcons[selectedCity]}
          alt={`Selected City ${selectedCity + 1} Icon`}
        />
      </div>
      <div className="city-right-section">
        {cityNames.map((city, index) => (
          <p
            key={index}
            className={`city-name ${selectedCity === index ? 'city-selected' : ''}`}
            onClick={() => updateCity(index)}
          >
            {city}
          </p>
        ))}
      </div>
    </div>
  );
};

export default CitiesIntro;
