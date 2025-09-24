import { useState, useEffect } from 'react';
import './BubbleTitle.css';

const colors = [
  '#ff3cac', // pink
  '#ffcc00', // yellow
  '#00c4ff', // blue
  '#32d74b', // green
  '#ff6b6b', // red
  '#a259ff', // purple
];

// Helper to darken hex colors by a percentage
function darkenColor(hex, percent) {
  hex = hex.replace(/^#/, '');
  const num = parseInt(hex, 16);
  let r = (num >> 16) & 0xFF;
  let g = (num >> 8) & 0xFF;
  let b = num & 0xFF;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return `rgb(${r}, ${g}, ${b})`;
}

const BubbleTitle = ({ text, radius = 0, totalArc = 0, fontSize = 3, verticalOffset = 0 }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chars = [...text];
  const charCount = chars.length;

  const getResponsiveSpacing = () => {
    if (windowWidth <= 480) return 20;
    if (windowWidth <= 768) return 30;
    return 30;
  };
  
  const getResponsiveRadius = () => {
    if (windowWidth <= 480) return radius * 0.4;
    if (windowWidth <= 768) return radius * 0.6;
    return radius;
  };
  
  const getResponsiveArc = () => {
    if (windowWidth <= 480) return totalArc * 0.5;
    if (windowWidth <= 768) return totalArc * 0.7;
    return totalArc;
  };
  
  const extraSpacing = getResponsiveSpacing(); 
  const totalExtraOffset = extraSpacing * (charCount - 1);
  const responsiveRadius = getResponsiveRadius();
  const responsiveArc = getResponsiveArc();

  if (radius === 0 || totalArc === 0) {
    return (
      <h1
        className="bubble-title"
        style={{ fontSize: `${fontSize}rem`, marginTop: verticalOffset }}
      >
        {chars.map((char, i) => {
          const color = char === ' ' ? 'transparent' : colors[i % colors.length];
          const shadowColor = color === 'transparent' ? 'transparent' : darkenColor(color, 0.5);
          return (
            <span
              key={i}
              style={{
                color,
                display: 'inline-block',
                width: char === ' ' ? '0.2em' : 'auto',
                marginRight: '0.1em',
                textShadow: char === ' ' ? 'none' : `0 6px 0 ${shadowColor}`,
              }}
            >
              {char}
            </span>
          );
        })}
      </h1>
    );
  }

  return (
    <h1
      className="bubble-title"
      style={{
        fontSize: `${fontSize}rem`,
        position: 'relative',
        height: responsiveRadius / 2 + (windowWidth <= 480 ? 30 : 40),
        marginTop: verticalOffset,
        marginBottom: windowWidth <= 480 ? '0.3em' : '0.2em',
      }}
    >
      {chars.map((char, i) => {
        const rotation = -responsiveArc / 2 + i * (responsiveArc / (charCount - 1));
        const rad = (rotation * Math.PI) / 180;
        const baseX = responsiveRadius * Math.sin(rad);
        const y = responsiveRadius * (1 - Math.cos(rad));
        const x = baseX + i * extraSpacing - totalExtraOffset / 2;
        const color = char === ' ' ? 'transparent' : colors[i % colors.length];
        const shadowColor = color === 'transparent' ? 'transparent' : darkenColor(color, 0.5);

        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `calc(50% + ${x}px)`,
              top: `${y}px`,
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              transformOrigin: 'bottom center',
              color,
              width: char === ' ' ? '0.2em' : 'auto',
              display: 'inline-block',
              zIndex: 1,
              textShadow: char === ' ' ? 'none' : `0 6px 0 ${shadowColor}`,
            }}
          >
            {char}
          </span>
        );
      })}
    </h1>
  );
};

export default BubbleTitle;
