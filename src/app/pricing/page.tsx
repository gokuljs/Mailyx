"use client";
import React from "react";
import { GlowingEffect } from "../_components/glowing-effect";
import { HoverBorderGradient } from "../_components/hover-border-gradient";
import ParticlesBackground from "../_components/Particles";
import { plans } from "@/lib/Constants";

import usePaddleOverlayCheck from "@/hooks/usePaddleOverlayCheck";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import useSubscriptionInfo from "@/hooks/useSubscriptionInfo";
import NavBar from "../_components/navbar";
import Footer from "../_components/footer";

const Pricing = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { handleCheckout } = usePaddleOverlayCheck();
  const { isSubscribed } = useSubscriptionInfo();
  const router = useRouter();

  return (
    <>
      <div className="flex min-h-screen flex-col items-center bg-black/10 pt-40 text-white">
        <NavBar />
        <h2 className="mb-4 flex justify-center bg-gradient-to-b from-white to-gray-400 bg-clip-text text-center text-6xl font-bold text-transparent">
          Simple and Affordable <br /> Pricing Plans
        </h2>
        <p className="text-muted-foreground mx-auto mb-10 max-w-xl text-center text-xl">
          Start managing your inbox smarter with AI-enhanced tools.
        </p>

        <div className="grid w-full max-w-[1200px] grid-cols-1 gap-8 px-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col rounded-2xl border border-gray-200/9 bg-gradient-to-b from-white/5 to-transparent px-6 py-8 text-white backdrop-blur-3xl"
            >
              <GlowingEffect
                borderWidth={2}
                spread={50}
                glow={true}
                disabled={false}
                proximity={100}
                inactiveZone={0.1}
                variant="white"
              />
              {/* Notice: 'flex flex-col flex-1' to ensure stretch */}
              <div className="flex flex-1 flex-col justify-between bg-transparent">
                <div>
                  <h3 className="mb-4 flex items-center justify-between bg-gradient-to-b from-white to-gray-400 bg-clip-text text-2xl font-semibold text-transparent">
                    {plan.name}
                    {plan.highlighted && (
                      <HoverBorderGradient
                        as="button"
                        duration={1}
                        clockwise={true}
                        className="!bg-white/11 px-2 py-1"
                      >
                        <div className="rounded-full bg-transparent text-xs">
                          Most Popular
                        </div>
                      </HoverBorderGradient>
                    )}
                  </h3>

                  <p className="mb-2 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-4xl font-bold text-transparent">
                    {plan.price}
                  </p>

                  <p className="mb-6 text-sm text-gray-400">
                    {plan.description}
                  </p>
                  <ul className="mb-6 w-full space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-gray-300"
                      >
                        <span className="text-white/40">✔</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Button pushed to bottom using mt-auto inside flex */}
                {!isSubscribed && (
                  <button
                    onClick={() => {
                      if (plan.id === "free") {
                        router.push("/mail");
                        return;
                      }
                      if (isSignedIn && plan.priceId) {
                        handleCheckout(plan.priceId, plan.id);
                      } else {
                        router.push("/sign-in");
                      }
                    }}
                    className={`w-full ${plan.buttonColor} mt-auto cursor-pointer rounded-xl border border-transparent px-6 py-2 text-white transition-all duration-150 hover:border hover:${plan?.borderColor ?? "border-gray-100"} hover:opacity-70`}
                  >
                    {plan.buttonText}
                  </button>
                )}
                {plan.id !== "free" && isSubscribed && (
                  <button
                    onClick={() => {
                      if (isSignedIn && plan.priceId) {
                        router.push("/settings");
                      } else {
                        router.push("/sign-in");
                      }
                    }}
                    className={`w-full ${plan.buttonColor} mt-auto cursor-pointer rounded-xl border border-transparent px-6 py-2 text-white transition-all duration-150 hover:border hover:${plan?.borderColor ?? "border-gray-100"} hover:opacity-70`}
                  >
                    {isSubscribed ? "Manage Subscription" : plan.buttonText}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="z-50 w-full bg-transparent">
          <Footer />
        </div>
      </div>
      <ParticlesBackground />
    </>
  );
};

export default Pricing;
