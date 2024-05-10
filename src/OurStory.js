import React from "react";
import './styles.css'; // Create this CSS file to style the OurStory section
import JarLogo from './assets/images/JarLogo.png'
import MisterTel from './assets/images/mistertel.png'

const OurStory = () => {
  return (
    <section className="our-story">
      <div className="NFT-Exam-Story">
                <img src={JarLogo} alt="Jar"></img>
            </div>
      <div className="story-container">
        <h2 className="story-title"></h2>
        <p className="story-content">"THE MYSTERTEL BOTTLE"
        <p> A CONTAINER HIDDEN DEEP WITHIN THE MYSTERIOUS LAND.</p>
        <p> ALL YOU NEED TO DO IS OPEN YOUR HEART AND STEP INTO</p>
        <p> THE WONDROUS REALM OF THIS TINY WORLD.</p>
        <p> EVERY HEART WILL FIND SOLACE,</p>
        <p> EVERY HEART WILL FIND COMFORT,</p>
        <p> AND EVERY HEART WILL FIND RENEWED STRENGTH.</p>
        <p> COME AND DISCOVER YOUR OWN MYSTERTEL BOTTLE.</p>
        </p>
      </div>
      <div className="Mistertel-intro">
        <img src={MisterTel} alt="Tel"></img>
      </div>
      <div className="intro-container">
        <h2 className="intro-title">What are <span class="intro-title-lastword"> MysteryJars</span></h2>
        <p className="intro-content">Robotos is a collection of algorithmically generated droid characters designed by 
        Pablo Stanley and minted as NFTs on the Ethereum blockchain. The 1st generation of 
        10,000 droids will be constructed from various metal outfits, tin faces, digital accessories, top pieces, faces, backpacks, arms, and colors. Robotos have different 
        body types, some rarer than others, and... there are rumors that you could find humans 
        pretending to be robots too. Is it true?</p>

        <h2 className="intro-title">What are <span class="intro-title-lastword"> Eden Verden</span></h2>
        <p className="intro-content">President Lyndon Johnson proposed the development of a plan called the Great Society, which was a plan with an ambitious goal to improve 
        the standard of living of every American. One of these important Great Society programs was Medicare. This plan helped to pay the hospital bills of citizens over the 
        age of 65. Similar to this program, Medicaid gave states money to help poor people of all ages with medical bills. Along with this, he fought to help Americans who 
        lived below the poverty line. The Economic Opportunity Act was passed in 1964 to set up job-training programs for the poor. It also gave loans to businesses poor 
        sections of the cities and offered loans to poor farmers.</p>

        <h2 className="intro-title">What do I get?</h2>
        <p className="intro-content">คุณจะได้ NFTs ของ MysteryJars ตามรายละเอียดแต่ละ Collection</p>

        <h2 className="intro-title">Why <span class="intro-title-lastword"> Eden Verden</span></h2>
        <p className="intro-content">By collecting Robotos you'll have a voice in the community and help guide the direction of the project and development of the story. 
        Already some great ideas have come from the community. Working together we can continue the grow the Robotos ecosystem!</p>

        <h2 className="intro-title">What's an NFT? </h2>
        <p className="intro-content">NFT stands for "Non-fungible token," which means that it's a unique, digital item with blockchain-managed ownership that users can buy, 
        own, and trade. Some NFT's fundamental function is to be digital art. But they can also offer additional benefits like exclusive access to websites, event tickets, 
        game items, and ownership records for physical objects. Think of it as a unique piece of art that can also work as a "members-only" card. Robotos works like this.</p>

        <h2 className="intro-title">What's an NFT? </h2>
        <p className="intro-content">New to NFTs? No worries, here are some steps on what you need to do to get your Roboto.
        Download the metamask.io extension for the Chrome/Brave browser or app on mobile. This will allow you to make purchases with Ethereum and can be found in the extensions tab. 
        If you are on mobile, you must use the Metamask App Browser You can purchase Ethereum through the Metamask Wallet using Wyre or Send Ethereum from an exchange like Coinbase.
        Click on Connect at the top of the page and connect your Metamask. Once joined, you will be able to purchase the NFTs in the mint section. You will be prompted to sign your 
        transaction. FYI, there will be a fee associated with every transaction related to gas prices. Once you have made your purchase, your Roboto NFTs will be viewable in your 
        wallet and on OpenSea.</p>
        </div>
    </section>
  );
};

export default OurStory;
