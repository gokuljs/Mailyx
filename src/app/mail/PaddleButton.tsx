import { Button } from "@/components/ui/button";
import React from "react";

type Props = {};

const PaddleButton = (props: Props) => {
  const isSubscribed = true;
  const handleClick = () => {
    console.log("Handle Subscription click");
  };
  return (
    <Button className="w-fit cursor-pointer bg-gradient-to-br from-zinc-900 to-orange-400/50 transition-all duration-150 outline-none">
      {isSubscribed ? "Manage Subscription" : "Subscribe"}
    </Button>
  );
};

export default PaddleButton;
