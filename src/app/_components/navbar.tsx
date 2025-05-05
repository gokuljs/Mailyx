import React from "react";
import { GlowingEffect } from "./glowing-effect";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const NavBar = () => {
  return (
    <div className="fixed top-[20px] left-[50%] z-[999] h-[60px] w-[90%] -translate-x-1/2 transform rounded-xl bg-transparent p-[0.2px]">
      <div className="flex h-full w-full items-center justify-between rounded-xl bg-cover bg-center bg-no-repeat px-7">
        <div>
          <Link href="/">
            <BrandLogo width={40} height={35} />
          </Link>
        </div>
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
        </div>
      </div>
    </div>
  );
};

export default NavBar;
