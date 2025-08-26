import Image from "next/image";
import logo from "@/assets/logo.png";
import Carousel from "../components/Carousel";
import WaButton from "../components/WaButton";
import bg from "@/assets/bg.png";
import Button from "@/components/Button";
import ProfileHeader from "../components/ProfileHeader";
import { FaTruck, FaFire, FaCreditCard } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image 
          src={bg} 
          alt="background" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center p-4 md:p-6 min-h-[80px]">
        {/* Logo - Centered */}
        <div className="w-24 sm:w-32 md:w-40 lg:w-48">
          <Image 
            src={logo} 
            alt="Bipang Apung Logo" 
            className="w-full h-auto drop-shadow-lg"
            priority
          />
        </div>
        
        {/* Profile - Fixed position top right */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[99999]">
          <ProfileHeader />
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-0 flex-1 flex flex-col items-center justify-center px-4 py-8 text-white text-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Title */}
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 text-shadow-lg leading-tight">
              Babi Panggang Kriuk
            </h1>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 sm:px-6 py-2 rounded-full inline-block text-base sm:text-lg md:text-xl lg:text-2xl font-semibold shadow-lg">
              Mulai dari Rp 50.000/porsi
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed px-2">
            Nikmati kelezatan babi panggang kriuk dengan cita rasa autentik yang telah dipercaya sejak lama. 
            Daging empuk dengan kulit yang kriuk, bumbu meresap sempurna!
          </p>

          {/* Image Carousel */}
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto mb-6 sm:mb-8">
            <Carousel />
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
            <div className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-200">
              <Button text={"Pesan Sekarang"} className="w-full sm:w-auto" />
            </div>
            <div className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-200">
              <WaButton />
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 px-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
              <div className="mb-3 sm:mb-4 flex justify-center">
                <FaTruck className="text-2xl sm:text-3xl md:text-4xl text-orange-400" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Delivery Cepat</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Pesan online dan kami antar ke lokasi Anda</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
              <div className="mb-3 sm:mb-4 flex justify-center">
                <FaFire className="text-2xl sm:text-3xl md:text-4xl text-red-400" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Selalu Fresh</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Dimasak fresh setiap hari dengan resep rahasia</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
              <div className="mb-3 sm:mb-4 flex justify-center">
                <FaCreditCard className="text-2xl sm:text-3xl md:text-4xl text-green-400" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Bayar Mudah</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Berbagai metode pembayaran tersedia</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
