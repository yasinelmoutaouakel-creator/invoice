import React from 'react';
import logoImage from './logo.png';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={logoImage} 
        alt="RANYFRESH Logo" 
        style={{ width: '300px', height: 'auto' }}
        className="object-contain"
      />
    </div>
  );
};

export default Logo;