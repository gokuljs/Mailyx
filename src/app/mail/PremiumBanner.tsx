"use client";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import PaddleButton from "./PaddleButton";
import BannerContent from "./BannerContent";
import { FREE_CREDITS_PER_DAY } from "@/lib/Constants";
import useSubscriptionInfo from "@/hooks/useSubscriptionInfo";
import { api } from "@/trpc/react";
import useThreads from "@/hooks/useThreads";

const PremiumBanner = () => {
  const { subInfo, isLoading, isSubscribed } = useSubscriptionInfo();
  const { accountId } = useThreads();
  const { data: remainingCredits } = api.account.chatBotInteraction.useQuery({
    accountId,
  });
  const test = api.useUtils();
  React.useEffect(() => {
    setTimeout(() => {
      test.subscription.getSubscriptionInfo.invalidate();
    }, 2000);
  }, []);
  if (isLoading) return <></>;
  return (
    <div className="premium-card relative flex h-40 flex-1 flex-col justify-between overflow-hidden rounded-xl p-2">
      {isSubscribed ? (
        <BannerContent
          heading="Premium Plan"
          subtext="Ask as many questions as you want with our Pro plan."
        />
      ) : (
        <BannerContent
          heading="Basic Plan"
          credits={remainingCredits}
          total={FREE_CREDITS_PER_DAY}
          subtext="Upgrade to Pro to ask as many questions..."
        />
      )}
      <PaddleButton isSubscribed={isSubscribed} />
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
