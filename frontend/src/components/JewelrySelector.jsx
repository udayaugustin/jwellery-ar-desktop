import { useState } from 'react';

/**
 * JewelrySelector component allows users to select different jewelry styles.
 */
function JewelrySelector({ onSelect, currentSelection }) {
  const jewelry = [
    {
      id: 1,
      name: 'Gold Hoops',
      type: 'earrings',
      color: '#FFD700',
      modelPath: '/models/gold-hoop-earring.glb', // Add your 3D model file here
      scale: 1.5,
    },
    {
      id: 2,
      name: 'Silver Studs',
      type: 'earrings',
      color: '#C0C0C0',
      modelPath: '/models/silver-stud-earring.glb', // Add your 3D model file here
      scale: 1.2,
    },
    {
      id: 3,
      name: 'Rose Gold',
      type: 'earrings',
      color: '#B76E79',
      modelPath: '/models/rose-gold-earring.glb', // Add your 3D model file here
      scale: 1.5,
    },
    {
      id: 4,
      name: 'Diamond',
      type: 'earrings',
      color: '#E0E0E0',
      modelPath: '/models/diamond-earring.glb', // Add your 3D model file here
      scale: 1.3,
    },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        gap: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '15px 25px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)',
      }}
    >
      {jewelry.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          style={{
            padding: '12px 20px',
            background:
              currentSelection?.id === item.id
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(255, 255, 255, 0.8)',
            border:
              currentSelection?.id === item.id
                ? '2px solid #4CAF50'
                : '2px solid transparent',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: currentSelection?.id === item.id ? '600' : '500',
            color: '#333',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px',
            minWidth: '90px',
          }}
          onMouseEnter={(e) => {
            if (currentSelection?.id !== item.id) {
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentSelection?.id !== item.id) {
              e.target.style.background = 'rgba(255, 255, 255, 0.8)';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: item.color,
              border: '2px solid rgba(0, 0, 0, 0.2)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          />
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
}

export default JewelrySelector;
