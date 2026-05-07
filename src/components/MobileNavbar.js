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

  const currentQuery = searchParams.get('cart') === 'open' ? 'cart=open' : '';
  const activeIndex = navItems.findIndex(item => pathname === item.basePath && currentQuery === item.query);

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-[100]">
      <div className="relative bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] px-2 h-16 flex justify-around items-center shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Sliding Indicator */}
        <div
          className="absolute transition-all duration-500 ease-in-out bg-orange-500/10 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)] rounded-full z-0"
          style={{
            width: activeIndex === 1 ? '5.5rem' : '3.5rem',
            height: activeIndex === 1 ? '5.5rem' : '3.5rem',
            left: activeIndex === 0 ? 'calc(16.66% - 1.75rem)' : activeIndex === 1 ? 'calc(50% - 2.75rem)' : 'calc(84.5% - 1.75rem)',
            top: activeIndex === 1 ? '-1.25rem' : 'calc(50% - 1.75rem)',
            opacity: activeIndex !== -1 ? 1 : 0
          }}
        />

        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          const isCenter = index === 1;

          return (
            <Link
              key={index}
              href={item.path}
              className={`relative z-10 transition-all duration-500 flex flex-col items-center justify-center group ${isCenter
                ? `w-24 h-24 -top-4 backdrop-blur-3xl rounded-full border-2 ${isActive ? 'border-orange-500' : 'border-white/20'
                }`
                : 'w-10 h-10'
                }`}
              aria-label={item.label}
            >
              <div className={`transition-all duration-500 ${isCenter ? (isActive ? 'scale-110' : 'scale-100 group-hover:scale-105') : (isActive ? 'scale-110' : 'group-hover:scale-110')
                } ${isActive && !isCenter ? 'drop-shadow-[0_0_5px_rgba(249,115,22,0.6)]' : ''}`}>
                <div className={isActive ? 'text-orange-500' : 'text-white/40'}>
                  {item.icon}
                </div>
              </div>

              {isActive && (
                <span className={`absolute rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse ${isCenter ? 'bottom-2 w-1.5 h-1.5' : 'bottom-1 w-1 h-1'
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
