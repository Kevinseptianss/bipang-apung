import Image from "next/image";
import logo from "@/assets/logo.png";
import Carousel from "../components/Carousel";
import WaButton from "../components/WaButton";
import bg from "@/assets/bg.png";
import Button from "@/components/Button";

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="absolute">
        <Image src={bg} alt="background" className="w-full h-full" />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-80" />
      </div>
      <div className="relative flex flex-row items-center justify-center p-5">
        <div className="flex items-center w-[50%]">
          <Image src={logo} alt="logo" />
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center text-3xl">
        <h1 className="font-bold">Babi Panggang Kriuk</h1>
        <h2 className="text-xl">Harga Rp 40.000/porsi</h2>
      </div>
      <div className="flex flex-row items-center justify-center p-5">
        <div className="w-[70%]">
          <Carousel />
        </div>
      </div>
      <div className="relative flex items-center justify-center py-2">
        <Button text={"Order Online"} />
      </div>
      <div className="relative flex items-center justify-center py-2">
        <WaButton />
      </div>
    </div>
  );
}
