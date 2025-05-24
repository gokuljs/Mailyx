"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { HoverBorderGradient } from "./hover-border-gradient";

export default function StartMailyxButton({ text }: { text: string }) {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleClick = () => {
    router.push(isSignedIn ? "/mail" : "/waitlist");
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
