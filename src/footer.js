import React from "react";
import FooterLogo from './assets/images/FooterLogo.png'

const footer = () => {
  return (
    <footer className="footer-container">
      <div className="logo-container">
      <img src={FooterLogo} alt="footlogo" />
      </div>
      &copy; 2023 EDENVERDEN.
    </footer>
  );
};

export default footer;