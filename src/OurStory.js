import React from "react";
import './OurStory.css'; // Create this CSS file to style the OurStory section
import Faq from './assets/images/24770171_104.png'
import MisterTel from './assets/images/mistertel.png'

const OurStory = () => {
  return (
    <section className="our-story">
      
      <div className="intro-container">
        <div class="faq-text">
        <h2>FAQ</h2>
        <h3 className="intro-title">What are FUZZY FRIENDS?</h3>
        <p className="intro-content">The FUZZY FRIENDS NFT collection is a collection of unique digital art pieces featuring adorable, 
          furry creatures. Each NFT represents a specific character with its own unique traits and attributes. 
          Owning a FUZZY FRIENDS NFT grants you exclusive access to the community and potential future benefits</p>

        <h2 className="intro-title">What's an NFT? </h2>
        <p className="intro-content">NFT stands for "Non-fungible token," which means that it's a unique, digital item with blockchain-managed ownership that users can buy, 
        own, and trade. Some NFT's fundamental function is to be digital art. But they can also offer additional benefits like exclusive access to websites, event tickets, 
        game items, and ownership records for physical objects. Think of it as a unique piece of art that can also work as a "members-only" card. Robotos works like this.</p>

        <h2 className="intro-title">How do I get my stu​ff ? </h2>
        <p className="intro-content">Visit Your Stuff to view all the assets associated with your Roboto, including the SVG (vector graphics), transparent background,  and more.</p>
        </div>
      </div>
      <div className="NFT-Exam-Story">
          <img src={Faq} alt="FAQ"></img>
      </div>
    </section>
  );
};

export default OurStory;
