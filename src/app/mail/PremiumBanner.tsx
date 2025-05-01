import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";

const PremiumBanner = () => {
  return (
    <div className="premium-card relative flex h-40 flex-1 flex-col justify-between overflow-hidden rounded-xl p-2">
      <div className="z-40">
        <h2 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-xl font-semibold text-transparent">
          Premium Plus
        </h2>
        <div className="mt-1 w-[70%] text-xs text-zinc-400">
          Ask as many questions has you want
        </div>
      </div>
      <Button className="w-[40%] cursor-pointer bg-gradient-to-br from-zinc-900 to-orange-400/50 transition-all duration-150 outline-none">
        Subscribe
      </Button>
      <Image
        src={"/bg-image.png"}
        alt="banner-image"
        width={200}
        height={200}
        className="absolute right-[-50px] bottom-[-70px] z-0"
      />
    </div>
  );
};

export default PremiumBanner;
