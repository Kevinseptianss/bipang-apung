'use client'
// components/ImageCarousel.js
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

// Import your images (replace with your actual image paths)
import Img1 from '@/assets/img1.jpg';
import Img2 from '@/assets/img2.jpg';
import Img3 from '@/assets/img3.jpg';
import Img4 from '@/assets/img4.jpg';
import Img5 from '@/assets/img5.jpg';
import Image from 'next/image';

const Carousel = () => {
  return (
    <div className="relative w-full">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={false}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        loop={true}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/10]"
      >
        <SwiperSlide>
          <div className="relative w-full h-full">
            <Image 
              src={Img1} 
              alt="Babi Panggang Kriuk - Tampilan 1" 
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg md:text-xl font-bold text-shadow">Babi Panggang Kriuk</h3>
              <p className="text-sm md:text-base text-shadow">Kulit yang kriuk, daging yang empuk</p>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-full">
            <Image 
              src={Img2} 
              alt="Babi Panggang Kriuk - Tampilan 2" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg md:text-xl font-bold text-shadow">Bumbu Meresap Sempurna</h3>
              <p className="text-sm md:text-base text-shadow">Dengan resep turun temurun</p>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-full">
            <Image 
              src={Img3} 
              alt="Babi Panggang Kriuk - Tampilan 3" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg md:text-xl font-bold text-shadow">Disajikan Fresh</h3>
              <p className="text-sm md:text-base text-shadow">Langsung dari dapur kami</p>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-full">
            <Image 
              src={Img4} 
              alt="Babi Panggang Kriuk - Tampilan 4" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg md:text-xl font-bold text-shadow">Porsi Melimpah</h3>
              <p className="text-sm md:text-base text-shadow">Harga terjangkau, kualitas terbaik</p>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-full">
            <Image 
              src={Img5} 
              alt="Babi Panggang Kriuk - Tampilan 5" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg md:text-xl font-bold text-shadow">Siap Delivery</h3>
              <p className="text-sm md:text-base text-shadow">Pesan online, antar ke rumah</p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Carousel;