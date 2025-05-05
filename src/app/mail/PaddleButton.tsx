import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { subscribe } from "diagnostics_channel";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  isSubscribed: boolean;
};

const PaddleButton = ({ isSubscribed }: Props) => {
  const router = useRouter();
  const { mutateAsync } = api.subscription.getCustomerPortalInfo.useMutation({
    onSuccess: (data) => {
      console.log(data?.portalUrl);
      if (data?.portalUrl?.general?.overview) {
        window.location.href = data?.portalUrl?.general?.overview;
      } else {
        console.error("Customer portal URL not found in response:", data);
      }
    },
    onError: (error) => {
      console.error("Failed to fetch customer portal info:", error);
    },
  });

  const handleClick = async () => {
    if (!isSubscribed) {
      router.push("/pricing");
      return;
    }
    try {
      await mutateAsync();
    } catch (error) {
      console.log("Mutation triggered, waiting for redirect or error...");
    }
  };
  return (
    <Button
      onClick={handleClick}
      className="z-50 w-fit cursor-pointer bg-gradient-to-br from-zinc-900 to-orange-400/50 transition-all duration-150 outline-none"
    >
      {isSubscribed ? "Manage Subscription" : "Subscribe"}
    </Button>
  );
};

export default PaddleButton;
