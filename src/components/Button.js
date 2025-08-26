// components/Button.js
import React from 'react';

const Button = ({ text, href = "/order", className = "" }) => {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 font-semibold text-base sm:text-lg transform hover:scale-105 hover:shadow-xl min-w-[200px] ${className}`}
    >
      {text}
    </a>
  );
};

export default Button;