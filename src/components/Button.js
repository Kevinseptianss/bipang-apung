// components/WhatsAppButton.js
import React from 'react';

const Button = ({ text }) => {
  return (
    <a
      href="/order"
      className="inline-flex items-center justify-center bg-gray-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300"
    >
      {text}
    </a>
  );
};

export default Button;