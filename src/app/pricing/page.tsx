import React, { useCallback } from "react";
import { GlowingEffect } from "../_components/glowing-effect";
import { HoverBorderGradient } from "../_components/hover-border-gradient";
import ParticlesBackground from "../_components/Particles";

const Pricing = () => {
  const plans = [
    {
      name: "Free Tier",
      price: "$0",
      description: "Great for getting started and trying basic features.",
      features: [
        "Sync 1 email account",
        "20 chats/month",
        "Last 30 days search",
        "Basic keyboard shortcuts",
      ],
      buttonText: "Start for Free",
      highlighted: false,
      buttonColor: "bg-gray-400/20",
    },
    {
      name: "Pro Plan",
      price: "$25/mo",
      description: "Perfect for growing users needing unlimited access.",
      features: [
        "Sync up to 3 email accounts",
        "Unlimited AI Assistant",
        "Full AI Precision Search",
        "Priority Support",
      ],
      buttonText: "Subscribe to Pro",
      highlighted: true,
      buttonColor: "bg-orange-600",
      borderColor: "border-orange-300",
    },
    {
      name: "Pro Plan Yearly",
      price: "$250/yr",
      description: "Best value - save 2 months on annual billing.",
      features: [
        "Sync up to 3 email accounts",
        "Unlimited AI Assistant",
        "Full AI Precision Search",
        "Priority Support",
        "2 months free",
        "Best for power users",
      ],
      buttonText: "Subscribe Yearly",
      highlighted: false,
      buttonColor: "bg-gray-400/20",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center bg-[size:20px_20px] py-20 pt-40 text-white">
      <ParticlesBackground />
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

                <p className="mb-6 text-sm text-gray-400">{plan.description}</p>
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
              <button
                className={`w-full ${plan.buttonColor} mt-auto cursor-pointer rounded-xl border border-transparent px-6 py-2 text-white transition-all duration-150 hover:border hover:${plan?.borderColor ?? "border-gray-100"} hover:opacity-70`}
              >
                {plan.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
