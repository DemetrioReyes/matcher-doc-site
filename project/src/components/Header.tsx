import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-700 p-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="w-48 h-24 mr-8 flex items-center">
          <img 
            src="./assets/matcherDoc3.png" 
            alt="Matcher Doc Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <nav className="flex gap-8 ml-auto">
          <Link to="/verify" className="text-white hover:underline text-base font-medium">Online Verification</Link>
          <Link to="/pricing" className="text-white hover:underline text-base font-medium">Pricing</Link>
          <Link to="/privacy" className="text-white hover:underline text-base font-medium">Privacy</Link>
          <Link to="/contact" className="text-white hover:underline text-base font-medium">Contact</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 