"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import ParticlesBackground from "../_components/Particles";
import { GlowingEffect } from "../_components/glowing-effect";
import { SignIn, useUser, Waitlist } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center bg-black md:px-0">
      <ParticlesBackground />
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0">
          <GlowingEffect
            blur={0}
            borderWidth={3}
            spread={50}
            glow={true}
            disabled={false}
            proximity={80} // Responsive to mouse proximity
            inactiveZone={0.1}
            variant="stone"
          />
        </div>

        <div className="border-0.75 relative z-10 rounded-md">
          <Waitlist
            signInUrl="/sign-in"
            appearance={{
              baseTheme: [dark],
              variables: {
                colorBackground: "#000000",
                colorPrimary: "#57534e",
                colorText: "#ffff",
              },
            }}
            afterJoinWaitlistUrl="/"
          />
        </div>
      </div>
    </div>
  );
}
