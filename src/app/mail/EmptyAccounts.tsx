"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useSubscriptionInfo from "@/hooks/useSubscriptionInfo";
import { getAurinkoAuthUrl } from "@/lib/aruinko";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { Plus, Mail } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function EmptyAccounts() {
  const { isSignedIn } = useUser();
  const { data: accounts } = api.account.getAccounts.useQuery(undefined, {
    enabled: isSignedIn,
  });
  const { isSubscribed, isLoading } = useSubscriptionInfo();
  const [isLoadingButton, setIsLoadingButton] = useState(false);

  if (isLoading) return <></>;
  return (
    <div className="flex h-[calc(100vh-60px)] items-center justify-center bg-transparent">
      <div className="relative max-w-md">
        {/* Background glow effect */}
        <div className="absolute -inset-6 rounded-3xl bg-zinc-700/20 opacity-50 blur-3xl"></div>

        <Card className="relative overflow-hidden rounded-xl border-none bg-zinc-900 text-white shadow-lg">
          <CardContent className="relative flex flex-col items-center space-y-5 p-10">
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 p-3">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-xl font-semibold text-white">
              No accounts connected
            </h2>

            <p className="max-w-[280px] text-center text-sm text-zinc-400">
              Connect an email account to start managing all your messages in
              one beautiful place.
            </p>

            <Button
              onClick={async () => {
                try {
                  setIsLoadingButton(true);
                  const url = await getAurinkoAuthUrl("Google", isSubscribed);
                  console.log(url);
                  if (url) window.location.href = url;
                } catch (error) {
                  toast.error((error as Error).message);
                  console.error(error);
                } finally {
                  setIsLoadingButton(false);
                }
              }}
              className="mt-2 w-full bg-zinc-700 text-white hover:bg-zinc-600"
              disabled={isLoadingButton}
            >
              {isLoadingButton ? (
                <div className="flex items-center justify-center">
                  <span>Connecting</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Connect account
                  <Plus className="h-4 w-4" />
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
