import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import PaddleButton from "./PaddleButton";
import BannerContent from "./BannerContent";
import { FREE_CREDITS_PER_DAY } from "@/lib/Constants";

const PremiumBanner = () => {
  const isSubScribed = false;
  const remainIngCredits = 5;
  return (
    <div className="premium-card relative flex h-40 flex-1 flex-col justify-between overflow-hidden rounded-xl p-2">
      <BannerContent
        heading="Basic Plan"
        credits={remainIngCredits}
        total={FREE_CREDITS_PER_DAY}
        subtext="Upgrade to Pro to ask as many questions..."
      />
      <PaddleButton />
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
