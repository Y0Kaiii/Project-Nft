import React, { useState } from "react";
import './styles.css';

const FAQ = () => {
    const faqData = [
        {
          question: 'Whisper of the forgotten realm',
          answer: 'Whisper of the forgotten realm is trying to tell you something...'
        },
        {
          question: 'Riddles in the Enchanted Woods',
          answer: 'Mysteries await in the Enchanted Woods...'
        },
        {
          question: 'Serpentine Shores: Quest for the Lost Artifact',
          answer: 'The artifact echoes...'
        },
        {
          question: 'Chronicles of the Celestial Labyrinth',
          answer: 'The Celestial Labyrinth emerges...'
        }
      ];
    
      const [openIndex, setOpenIndex] = useState(null);
    
      const handleQuestionClick = (index) => {
        setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
      };
    
      return (
        <section className="faq-section">
        <h2 className="faq-title">Another NFT projects</h2>
          {faqData.map((faq, index) => (
            <div key={index} className="faq-item">
              <div
                className={`question ${openIndex === index ? 'open' : ''}`}
                onClick={() => handleQuestionClick(index)}
              >
                {faq.question}
              </div>
              <div className={`answer ${openIndex === index ? 'open' : ''}`}>
                {faq.answer}
              </div>
              {index < faqData.length - 1 && <div className="divider"></div>}
            </div>
          ))}
        </section>
      );
    };
    
    export default FAQ;
    
  