import React, { ReactNode } from 'react';

interface VerificationContainerProps {
  children: ReactNode;
}

const VerificationContainer: React.FC<VerificationContainerProps> = ({ children }) => {
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      <div className="border-b border-gray-200 bg-gray-50 py-3 px-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default VerificationContainer;