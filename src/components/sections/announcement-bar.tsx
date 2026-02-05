import React from 'react';

const AnnouncementBar = () => {
  return (
    <div 
      className="w-full bg-[#d8a4bc] flex items-center justify-center"
      style={{
        height: '35px', // Standard slim announcement bar height for editorial brands
        borderBottom: '1px solid black' // Consistent with the design system's border tokens
      }}
    >
      <p 
        className="text-black uppercase font-medium tracking-[0.1em]"
        style={{
          fontSize: '10px', // Exact pixel height from design requirements
          fontFamily: 'var(--font-sans)', // Using the Inter font defined in globals.css
          letterSpacing: '0.15em', // Increased letter spacing for the edgy, editorial minimalist look
        }}
      >
        Extended Returns Until Jan 15
      </p>
    </div>
  );
};

export default AnnouncementBar;