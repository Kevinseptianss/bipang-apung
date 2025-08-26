"use client";
import { useState, useEffect, useRef } from "react";
import { auth } from "@/config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

const ProfileHeader = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleToggleDropdown = () => {
    if (!showDropdown && buttonRef.current) {
      // Calculate position relative to viewport
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap
        right: window.innerWidth - rect.right
      });
    }
    setShowDropdown(!showDropdown);
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowDropdown(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSignIn = () => {
    window.location.href = "/details";
  };

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="flex items-center bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
      >
        <FaUser className="mr-2" size={14} />
        Masuk
      </button>
    );
  }

  return (
    <div className="relative z-[9999]">
      <button
        ref={buttonRef}
        onClick={handleToggleDropdown}
        className="flex items-center bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-2 transition-colors"
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName || "User"}
            width={32}
            height={32}
            className="rounded-full object-cover"
            unoptimized={true}
          />
        ) : (
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <FaUser className="text-white text-sm" />
          </div>
        )}
        <span className="ml-2 text-white text-sm font-medium hidden sm:block">
          {user.displayName || "User"}
        </span>
      </button>

      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="fixed w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-[99999] backdrop-blur-sm"
          style={{ 
            top: `${dropdownPosition.top}px`, 
            right: `${dropdownPosition.right}px` 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 border-b border-gray-700">
            <p className="text-white text-sm font-medium">
              {user.displayName || "User"}
            </p>
            <p className="text-gray-400 text-xs">{user.email}</p>
          </div>
          <div className="py-2">
            <Link
              href="/profile"
              onClick={handleProfileClick}
              className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm w-full text-left cursor-pointer"
            >
              <FaUser className="mr-2" size={14} />
              Profil & Riwayat
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm text-left cursor-pointer"
            >
              <FaSignOutAlt className="mr-2" size={14} />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
