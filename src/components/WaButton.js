// components/WhatsAppButton.js
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa'; // Import WhatsApp icon from React Icons

const WaButton = () => {
  // Replace with your WhatsApp number (include country code, e.g., +62 for Indonesia)
  const phoneNumber = '6287831100001';
  // Default message (optional)
  const message = 'Halo, saya tertarik dengan Babi Panggang Kriuk nya. Bisa info lebih lanjut?';

  // Generate the WhatsApp URL
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold text-base sm:text-lg transform hover:scale-105 hover:shadow-xl min-w-[200px]"
    >
      <FaWhatsapp className="mr-2 sm:mr-3" size={20} /> {/* WhatsApp icon */}
      Chat WhatsApp
    </a>
  );
};

export default WaButton;