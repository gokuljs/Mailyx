"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { Environments, initializePaddle, Paddle } from "@paddle/paddle-js";

const usePaddleOverlayCheck = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  useEffect(() => {
    if (!isSignedIn) return;
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENV as Environments;
    if (!environment) return;
    initializePaddle({
      environment: environment,
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_SIDE_TOKEN as string,
    }).then((paddle) => {
      paddle && setPaddle(paddle);
    });
  }, [isLoaded, isSignedIn, user]);

  const handleCheckout = (priceId: string) => {
    if (!paddle || !user) return alert("Paddle not initialized");
    console.log(user);
    const emailAddress = user?.emailAddresses?.[0]?.emailAddress;
    if (!emailAddress) return;

    paddle.Checkout.open({
      items: [{ priceId: priceId, quantity: 1 }],
      customer: {
        email: emailAddress,
      },
      settings: {
        displayMode: "overlay",
        theme: "dark",
        variant: "one-page",
        successUrl: `${process.env.NEXT_PUBLIC_URL}/mail`,
      },
      customData: {
        userId: user.id,
        emailAddress: emailAddress,
      },
    });
  };
  return { handleCheckout };
};

export default usePaddleOverlayCheck;
