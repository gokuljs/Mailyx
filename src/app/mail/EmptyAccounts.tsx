"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useSubscriptionInfo from "@/hooks/useSubscriptionInfo";
import { getAurinkoAuthUrl } from "@/lib/aruinko";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { Plus, Inbox, Loader } from "lucide-react";
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
      <Card className="max-w-sm text-center dark:bg-[hsl(20_14.3%_4.1%)]">
        <CardContent className="flex flex-col items-center space-y-4 py-8">
          {/* Replace with your favorite empty‑state SVG or illustration */}
          <Inbox className="h-12 w-12 text-gray-400" />

          <h2 className="text-2xl font-semibold text-zinc-600">
            No accounts connected
          </h2>

          <p className="text-muted-foreground">
            Connect an account to start managing your Emails in one place.
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
            className="cursor-pointer"
            disabled={isLoadingButton}
          >
            {isLoadingButton ? (
              <>
                <span className="mr-2">Connecting</span>
                <Loader className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Connect account
                <Plus />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
