import React, { useMemo } from 'react';

const RubberStamp = ({ date, color = '#0f172a', size = 220, className = '', style = {} }) => {
  // Random slight rotation for authenticity (-4 to 4 degrees)
  const rotation = useMemo(() => Math.random() * 8 - 4, []);
  
  const formattedDate = date 
    ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  // Width to height ratio of 2.2:1 for the rectangle
  const height = size * 0.45;

  return (
    <div 
      className={`rubber-stamp ${className}`}
      style={{ 
        width: size, 
        height: height, 
        transform: `rotate(${rotation}deg)`,
        opacity: 0.85,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
        display: 'inline-block',
        ...style
      }}
    >
      <svg viewBox="0 0 440 200" xmlns="http://www.w3.org/2000/svg">
        
        {/* Outer thick border */}
        <rect x="5" y="5" width="430" height="190" rx="15" ry="15" fill="none" stroke={color} strokeWidth="6" />
        
        {/* Inner thin border */}
        <rect x="15" y="15" width="410" height="170" rx="8" ry="8" fill="none" stroke={color} strokeWidth="2" />
        
        {/* Divider lines */}
        <line x1="15" y1="65" x2="425" y2="65" stroke={color} strokeWidth="2" />
        <line x1="15" y1="140" x2="425" y2="140" stroke={color} strokeWidth="2" />
        
        {/* Top Section - Company Name */}
        <text x="220" y="46" fontFamily="'Rajdhani', Arial, sans-serif" fontSize="26" fontWeight="bold" textAnchor="middle" fill={color} letterSpacing="2">
          DIOTRANICS ENTERPRISES LTD
        </text>

        {/* Middle Section - Title */}
        <text x="220" y="115" fontFamily="'Rajdhani', Arial, sans-serif" fontSize="36" fontWeight="900" textAnchor="middle" fill={color} letterSpacing="8">
          OFFICIAL
        </text>

        {/* Bottom Section - Date */}
        <text x="220" y="174" fontFamily="'Inter', monospace" fontSize="20" fontWeight="bold" textAnchor="middle" fill={color} letterSpacing="2">
          DATE: {formattedDate}
        </text>
        
        {/* Decorative elements */}
        <circle cx="35" cy="170" r="4" fill={color} />
        <circle cx="405" cy="170" r="4" fill={color} />
        <circle cx="35" cy="35" r="4" fill={color} />
        <circle cx="405" cy="35" r="4" fill={color} />

      </svg>
    </div>
  );
};

export default RubberStamp;
