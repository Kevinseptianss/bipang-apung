// components/WhatsAppButton.js
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa'; // Import WhatsApp icon from React Icons

const WaButton = () => {
  // Replace with your WhatsApp number (include country code, e.g., +62 for Indonesia)
  const phoneNumber = '6287831100001';
  // Default message (optional)
  const message = 'Halo, saya ingin order babi panggang Apung nya...';

  // Generate the WhatsApp URL
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300"
    >
      <FaWhatsapp className="mr-2" size={24} /> {/* WhatsApp icon */}
      Hubungi WA
    </a>
  );
};

export default WaButton;