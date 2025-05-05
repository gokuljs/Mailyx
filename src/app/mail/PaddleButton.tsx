import { Button } from "@/components/ui/button";
import { subscribe } from "diagnostics_channel";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  isSubscribed: boolean;
};

const PaddleButton = ({ isSubscribed }: Props) => {
  const router = useRouter();
  const handleClick = () => {
    if (!isSubscribed) {
      router.push("/pricing");
      return;
    }
    console.log("Handle Subscription click");
  };
  return (
    <Button
      onClick={handleClick}
      className="w-fit cursor-pointer bg-gradient-to-br from-zinc-900 to-orange-400/50 transition-all duration-150 outline-none"
    >
      {isSubscribed ? "Manage Subscription" : "Subscribe"}
    </Button>
  );
};

export default PaddleButton;
