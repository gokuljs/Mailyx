import React from "react";
import { GlowingEffect } from "./glowing-effect";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import StartMailyxButton from "./StartMailyxButton";
import { Button } from "@/components/ui/button";

const NavBar = () => {
  return (
    <div className="fixed top-[20px] left-[50%] z-[999] h-[60px] w-[90%] -translate-x-1/2 transform rounded-xl bg-transparent p-[0.2px]">
      <div className="flex h-full w-full items-center justify-between rounded-3xl bg-gradient-to-t from-neutral-950 to-white/10 px-7">
        <Link href="/">
          <div className="flex items-center gap-2">
            <BrandLogo width={40} height={35} />
            <span className="text-lg font-semibold text-stone-400">Mailyx</span>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            className="text-neutral-400 transition-colors duration-300 hover:text-white"
            href="/pricing"
          >
            Pricing
          </Link>
          <Link href="/contact-us">
            <div className="text-neutral-400 transition-colors duration-300 hover:text-white">
              Contact
            </div>
          </Link>
          <Link href="/features">
            <div className="text-neutral-400 transition-colors duration-300 hover:text-white">
              Features
            </div>
          </Link>
          <Link href="/mail">
            <Button className="cursor-pointer rounded-3xl border border-stone-400/30 bg-stone-700 font-semibold text-neutral-300 transition-all duration-150 hover:bg-black/80">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
