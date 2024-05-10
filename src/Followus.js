import React from 'react';
import './styles.css'; // Import your CSS file
import { FaYoutube, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Followus = () => {
  return (
    <section className="follow-section">
      <h2 className="follow-title">Follow Eden Verden</h2>
      <div className="social-icons">
        <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
          <FaYoutube />
        </a>
        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
          <FaFacebook />
        </a>
        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
          <FaInstagram />
        </a>
        <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
          <FaTwitter />
        </a>
      </div>
    </section>
  );
};

export default Followus;