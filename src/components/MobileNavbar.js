"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiUser } from "react-icons/fi";
import { usePathname, useSearchParams } from 'next/navigation';

const MobileNavbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navItems = [
    {
      icon: <FiShoppingCart size={24} />,
      path: '/cart',
      basePath: '/cart',
      query: '',
      label: 'Cart'
    },
    {
      icon: (
        <div className="relative w-18 h-18 opacity-100">
          <Image 
            src="/logo-circle.png" 
            alt="Menu" 
            fill 
            className="object-contain drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)] opacity-100" 
          />
        </div>
      ),
      path: '/order',
      basePath: '/order',
      query: '',
      label: 'Menu'
    },
    {
      icon: <FiUser size={24} />,
      path: '/profile',
      basePath: '/profile',
      query: '',
      label: 'Account'
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-[100]">
      <div className="relative bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] px-2 h-16 flex justify-around items-center shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {navItems.map((item, index) => {
          const currentQuery = searchParams.get('cart') === 'open' ? 'cart=open' : '';
          const isActive = pathname === item.basePath && currentQuery === item.query;
          const isCenter = index === 1;

          return (
            <Link 
              key={index} 
              href={item.path}
              className={`relative transition-all duration-500 flex flex-col items-center justify-center group ${
                isCenter 
                ? `w-24 h-24 -top-8 backdrop-blur-3xl rounded-full border-2 transition-all duration-500 ${
                    isActive 
                    ? 'bg-white/5 border-orange-500 scale-110' 
                    : 'bg-white/5 border-white/20 shadow-[0_10px_25px_rgba(0,0,0,0.3)]'
                  }`
                : `p-4 rounded-full transition-all duration-500 ${
                    isActive 
                    ? 'text-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-110' 
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                  }`
              }`}
              aria-label={item.label}
            >
              <div className={`transition-all duration-500 ${
                isCenter ? (isActive ? 'scale-110' : 'scale-100 group-hover:scale-105') : (isActive ? 'scale-110' : 'group-hover:scale-110')
              } ${isActive && !isCenter ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : ''}`}>
                {item.icon}
              </div>
              
              {isActive && (
                <span className={`absolute rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,1)] animate-pulse ${
                  isCenter ? 'bottom-2 w-2 h-2' : 'bottom-1 w-1.5 h-1.5'
                }`} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;
