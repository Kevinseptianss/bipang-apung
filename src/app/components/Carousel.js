'use client'
// components/ImageCarousel.js
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Import your images (replace with your actual image paths)
import Img1 from '@/assets/img1.jpg';
import Img2 from '@/assets/img2.jpg';
import Img3 from '@/assets/img3.jpg';
import Img4 from '@/assets/img4.jpg';
import Img5 from '@/assets/img5.jpg';
import Image from 'next/image';
const Carousel = () => {
  return (
    <Swiper
      spaceBetween={30} // Space between slides
      centeredSlides={true} // Center the active slide
      autoplay={{
        delay: 2500, // Autoplay delay in milliseconds
        disableOnInteraction: false, // Continue autoplay after user interaction
      }}
      pagination={{
        clickable: true, // Enable clickable pagination bullets
      }}
      navigation={false} // Enable navigation arrows
      modules={[Autoplay, Pagination, Navigation]} // Add required modules
      className="mySwiper" // Custom class for styling
    >
      <SwiperSlide>
        <Image src={Img1} alt="Slide 1" className='w-[100%] height-auto rounded-2xl' />
      </SwiperSlide>
      <SwiperSlide>
        <Image src={Img2} alt="Slide 2" className='w-[100%] height-auto rounded-2xl' />
      </SwiperSlide>
      <SwiperSlide>
        <Image src={Img3} alt="Slide 3" className='w-[100%] height-auto rounded-2xl' />
      </SwiperSlide>
      <SwiperSlide>
        <Image src={Img4} alt="Slide 4" className='w-[100%] height-auto rounded-2xl' />
      </SwiperSlide>
      <SwiperSlide>
        <Image src={Img5} alt="Slide 5" className='w-[100%] height-auto rounded-2xl' />
      </SwiperSlide>
    </Swiper>
  );
};

export default Carousel;