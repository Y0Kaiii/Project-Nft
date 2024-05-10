import React from "react";
import './styles.css';
import Terrarium from "./assets/images/Terrarium.jpg"

const ExploreMore = () => {
    const handleBoxClick = () => {
        // Handle the click event, e.g., navigate to a website
        window.location.href = 'https://google.com'; // Replace with your desired URL
      };
    return (
      <section className="explore-more-container">
        <a href="https://google.com" onClick={handleBoxClick} className="explore-more-link">
          <h2 className="explore-more-title">Explore for more</h2>
          <div className="explore-more-picture-box">
          <div className="gradient-layer"></div>
            <img src={Terrarium} alt="terra" className="centered-image"/>           
            <p className="bottom-left-text"> Terrarium
          </p>
        </div>
        </a>
      </section>
    );
  };
  
  export default ExploreMore;