"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ProviderSelector,
  type EmailProvider,
} from "@/components/email/ProviderSelector";
import useSubscriptionInfo from "@/hooks/useSubscriptionInfo";
import { getAurinkoAuthUrl } from "@/lib/aruinko";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { Plus, Mail } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useTheme } from "next-themes";

export function EmptyAccounts() {
  const { isSignedIn } = useUser();
  const { data: accounts } = api.account.getAccounts.useQuery(undefined, {
    enabled: isSignedIn,
  });
  const { isSubscribed, isLoading } = useSubscriptionInfo();
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [showProviderSelector, setShowProviderSelector] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<EmailProvider | null>(
    null,
  );
  const { theme } = useTheme();

  const handleProviderSelect = async (provider: EmailProvider) => {
    try {
      setIsLoadingButton(true);
      setLoadingProvider(provider);
      const url = await getAurinkoAuthUrl(provider, isSubscribed);
      console.log(url);
      if (url) window.location.href = url;
    } catch (error) {
      toast.error((error as Error).message);
      console.error(error);
    } finally {
      setIsLoadingButton(false);
      setLoadingProvider(null);
      setShowProviderSelector(false);
    }
  };

  if (isLoading) return <></>;
  return (
    <div className="flex h-[calc(100vh-60px)] items-center justify-center bg-transparent">
      <div className="relative max-w-md">
        {/* Background glow effect - works in both light and dark */}
        <div className="absolute -inset-6 rounded-3xl bg-stone-500/20 opacity-50 blur-3xl dark:bg-stone-400/20"></div>

        <Card className="relative overflow-hidden rounded-xl border border-stone-200/10 bg-stone-50/90 shadow-lg backdrop-blur-sm dark:bg-stone-900/90 dark:text-white">
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-stone-200/50 to-transparent opacity-40 dark:from-stone-700/30"></div>
          <CardContent className="relative flex flex-col items-center space-y-5 p-10">
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-200 shadow-sm dark:bg-stone-800 dark:text-white">
              <Mail className="h-8 w-8 text-stone-700 dark:text-stone-200" />
            </div>

            <h2 className="text-xl font-semibold text-stone-800 dark:text-white">
              No accounts connected
            </h2>

            <p className="max-w-[280px] text-center text-sm text-stone-600 dark:text-stone-400">
              Connect an email account to start managing all your messages in
              one beautiful place.
            </p>

            <Button
              onClick={() => setShowProviderSelector(true)}
              className="mt-2 w-full bg-stone-600 text-white hover:bg-stone-500 dark:bg-stone-700 dark:hover:bg-stone-600"
              disabled={isLoadingButton}
            >
              <div className="flex items-center justify-center gap-2">
                Connect account
                <Plus className="h-4 w-4" />
              </div>
            </Button>
          </CardContent>
        </Card>

        {showProviderSelector && (
          <ProviderSelector
            onSelect={handleProviderSelect}
            onCancel={() => setShowProviderSelector(false)}
            isLoading={isLoadingButton}
            loadingProvider={loadingProvider}
          />
        )}
      </div>
    </div>
  );
}
