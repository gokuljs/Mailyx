"use client";
import { Button } from "@/components/ui/button";
import { getAurinkoAuthUrl } from "@/lib/aruinko";
import React from "react";

const LinkAccountButton = () => {
  return (
    <Button
      onClick={async () => {
        const url = await getAurinkoAuthUrl("Google");
        console.log(url);
        if (url) window.location.href = url;
      }}
    >
      Test
    </Button>
  );
};

export default LinkAccountButton;
