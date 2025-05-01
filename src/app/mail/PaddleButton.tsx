import { Button } from "@/components/ui/button";
import React from "react";

type Props = {};

const PaddleButton = (props: Props) => {
  return (
    <Button className="w-[40%] cursor-pointer bg-gradient-to-br from-zinc-900 to-orange-400/50 transition-all duration-150 outline-none">
      Subscribe
    </Button>
  );
};

export default PaddleButton;
