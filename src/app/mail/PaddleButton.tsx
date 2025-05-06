import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { subscribe } from "diagnostics_channel";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  isSubscribed: boolean;
};

const PaddleButton = ({ isSubscribed }: Props) => {
  const router = useRouter();

  const handleClick = async () => {
    if (!isSubscribed) {
      router.push("/pricing");
      return;
    }
    router.push("/settings");
  };
  return (
    <Button
      onClick={handleClick}
      className="z-50 w-fit cursor-pointer bg-gradient-to-br from-stone-500 to-stone-700/90 text-neutral-300 transition-all duration-150 outline-none"
    >
      {isSubscribed ? "Manage Subscription" : "Subscribe"}
    </Button>
  );
};

export default PaddleButton;
