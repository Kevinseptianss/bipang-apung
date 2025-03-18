import Image from "next/image";
import logo from "@/assets/logo.png";
import Carousel from "./components/Carousel";
import WaButton from "./components/WaButton";

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center justify-center p-5">
        <div className="flex items-center w-[50%]">
          <Image src={logo} alt="logo" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center text-3xl">
        <h1 className="font-bold">Babi Panggang Kriuk</h1>
        <h2 className="text-xl">Harga Rp 40.000/ons</h2>
      </div>
      <div className="flex flex-row items-center justify-center p-5">
        <div className="w-[70%]">
          <Carousel />
        </div>
      </div>
      <div className="flex items-center justify-center">
        <WaButton />
      </div>
    </div>
  );
}
