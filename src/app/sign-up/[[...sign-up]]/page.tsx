"use client";
import { GlowingEffect } from "@/app/_components/glowing-effect";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="relative flex h-screen items-center justify-center bg-[#09090b]">
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
            variant="orange"
          />
        </div>

        <div className="border-0.75 relative z-10 rounded-md">
          <SignUp
            appearance={{
              baseTheme: [dark],
              variables: {
                colorBackground: "#000000",
                colorPrimary: "#f97316",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
