"use client";
import React, { useState, useEffect } from "react";
import { GlowingEffect } from "./glowing-effect";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import StartMailyxButton from "./StartMailyxButton";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const NavBar = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);

      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <div
      className={`fixed left-[50%] z-[999] w-[90%] -translate-x-1/2 transform rounded-xl bg-transparent p-[0.2px] transition-all duration-300 ${isVisible ? "top-[20px]" : "-top-[100px]"}`}
    >
      <div className="flex h-[60px] w-full items-center justify-between rounded-3xl bg-gradient-to-t from-neutral-950 to-white/10 px-4 md:px-7">
        <Link href="/">
          <div className="flex items-center gap-2">
            <BrandLogo width={40} height={35} />
            <span className="text-lg font-semibold text-stone-400">Mailyx</span>
          </div>
        </Link>
        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
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
          <Link href="/privacy">
            <div className="text-neutral-400 transition-colors duration-300 hover:text-white">
              Privacy
            </div>
          </Link>
          <Link href={isSignedIn ? "/mail" : "/waitlist"}>
            <Button className="cursor-pointer rounded-3xl border border-stone-400/30 bg-stone-700 font-semibold text-neutral-300 transition-all duration-150 hover:bg-black/80">
              Get Started
            </Button>
          </Link>
        </div>
        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-neutral-400 transition-colors duration-300 hover:text-white focus:outline-none"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute mt-2 w-full rounded-xl bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              className="text-neutral-400 transition-colors duration-300 hover:text-white"
              href="/pricing"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/contact-us"
              className="text-neutral-400 transition-colors duration-300 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="text-neutral-400 transition-colors duration-300 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Privacy
            </Link>
            <Link
              href={isSignedIn ? "/mail" : "/waitlist"}
              onClick={() => setIsMenuOpen(false)}
            >
              <Button className="w-full cursor-pointer rounded-3xl border border-stone-400/30 bg-stone-700 font-semibold text-neutral-300 transition-all duration-150 hover:bg-black/80">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default NavBar;
