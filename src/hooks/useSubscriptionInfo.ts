import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import React from "react";

function useSubscriptionInfo() {
  const { isSignedIn } = useUser();
  const { data: subInfo, isLoading } =
    api.subscription.getSubscriptionInfo.useQuery(undefined, {
      enabled: isSignedIn,
    });

  const isSubscribed = React.useMemo(() => {
    if (!subInfo) return false;
    const currentDate = new Date();
    const endDate = subInfo.endedAt ? new Date(subInfo.endedAt) : null;
    return subInfo.status === "ACTIVE" && (!endDate || currentDate < endDate);
  }, [subInfo]);

  return { subInfo, isLoading, isSubscribed };
}

export default useSubscriptionInfo;
