import React from 'react';

const PDFViewer = ({ images, onImageClick }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      {images.map((src, index) => (
        <img 
          key={index} 
          src={src} 
          alt={`Page ${index + 1}`} 
          style={{ width: "100%", borderRadius: "8px", cursor: 'pointer' }} 
          onClick={() => onImageClick(index)} // Acción al hacer clic en una página
        />
      ))}
    </div>
  );
};

export default PDFViewer;
