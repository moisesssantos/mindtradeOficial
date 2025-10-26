
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
