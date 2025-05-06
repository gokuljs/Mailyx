import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="-z-40 mt-20 w-full bg-gradient-to-b from-black/20 to-neutral-700/50 text-neutral-400/50">
      <div className="container mx-auto px-4 py-12">
        {/* Top Section: Logo + Link Columns - Adjust grid for mobile */}
        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Logo */}
          <div className="col-span-2 flex items-start md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/brand-logo.svg"
                alt="Mailyx Logo"
                width={32} // Slightly larger logo
                height={32}
              />
              <span className="bg-gradient-to-br from-stone-700 to-stone-950 bg-clip-text text-lg font-semibold">
                Mailyx
              </span>
            </Link>
          </div>

          {/* Company - Starts in the 1st column on mobile, 3rd on md */}
          <div className="col-span-1 md:col-start-3">
            <h3 className="mb-3 font-semibold text-neutral-100">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="hover:text-neutral-100">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-neutral-100">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal - Starts in the 2nd column on mobile, 4th on md */}
          <div className="col-span-1 md:col-start-4">
            <h3 className="mb-3 font-semibold text-neutral-100">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms-of-service"
                  className="hover:text-neutral-100"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-neutral-100">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Divider + Copyright + Socials */}
        <hr className="border-border/40 mb-8" />
        <div className="flex flex-col items-center justify-between text-sm md:flex-row">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Mailyx. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
