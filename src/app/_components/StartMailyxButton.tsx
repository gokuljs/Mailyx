"use client";
import { useRouter } from "next/navigation";
import { HoverBorderGradient } from "./hover-border-gradient";

export default function StartMailyxButton({ text }: { text: string }) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/mail");
  };

  return (
    <HoverBorderGradient
      as="button"
      duration={1}
      clockwise={true}
      onClick={handleClick}
      className="cursor-pointer"
    >
      {text}
    </HoverBorderGradient>
  );
}
