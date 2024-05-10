import React from 'react';
import Flickity from 'react-flickity-component';
import 'flickity/css/flickity.css';
import './styles.css';
import CollectionLogo from './assets/images/carolselbg.png';

const CollectionCarousel = () => {
  const collections = [
    { title: 'Collection 1', image: CollectionLogo },
    { title: 'Collection 2', image: CollectionLogo },
    { title: 'Collection 3', image: CollectionLogo },
    // Add more collections as needed
  ];

  const flickityOptions = {
    contain: true,
    pageDots: false,
    cellAlign: 'center', // or 'left', 'right', 'center'
    freeScroll: true,
  };

  return (
    <div className="collection-carousel-container">
      <Flickity
        className={'collection-carousel'} // Add custom class for styling
        elementType={'div'} // default 'div'
        options={flickityOptions}
        disableImagesLoaded={false}
        reloadOnUpdate
        static
      >
        {collections.map((collection, index) => (
          <div key={index} className="collection-cell">
            <h3>{collection.title}</h3>
            <img src={collection.image} alt={collection.title} />
            {/* Add more content as needed */}
          </div>
        ))}
      </Flickity>
    </div>
  );
};

export default CollectionCarousel;

