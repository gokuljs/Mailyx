"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import useSubscriptionInfo from "@/hooks/useSubscriptionInfo";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { subInfo, isLoading } = useSubscriptionInfo();
  const { mutate, isPending } =
    api.subscription.getCustomerPortalInfo.useMutation({
      onSuccess: (data) => {
        if (data?.portalUrl?.general?.overview) {
          window.location.href = data.portalUrl.general.overview;
        }
      },
      onError: (error) => {
        toast.error("Failed to open customer portal");
      },
    });
  // TODO: Fetch user subscription status and details

  const openCustomerPortal = async () => {
    if (!subInfo) return;
    try {
      await mutate();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen space-y-6 p-4 pb-16 md:p-10 dark:bg-[hsl(20_14.3%_4.1%)]">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 px-2 text-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and subscription.
        </p>
      </div>
      <Separator className="my-6" />

      {/* Subscription Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Manage your billing information and subscription plan.
            {/* TODO: Display current plan details here */}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-medium">Manage Billing</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Download your invoices, view your payment history, update payment
              methods, or cancel your subscription through our secure customer
              portal.
            </p>
            {/* TODO: Replace "#" with the actual customer portal link */}
            <Button
              asChild
              variant="outline"
              disabled={!subInfo || isPending}
              onClick={openCustomerPortal}
              className="flex w-fit items-center justify-center"
            >
              {isPending ? (
                <div>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading ...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Link href="#">Go to Customer Portal</Link>
                </div>
              )}
            </Button>
          </div>
          <Separator />
          <div>
            <h3 className="mb-2 text-lg font-medium">Change Plan</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Need more features or different limits? Explore our plans and find
              the best fit for you.
            </p>
            {/* TODO: Implement plan change flow/link */}
            <Button disabled variant="outline">
              Change Subscription Plan (Coming Soon)
            </Button>
            {/* Or link to pricing page:
             <Button asChild variant="outline">
               <Link href="/pricing">View Plans</Link>
             </Button>
             */}
          </div>
        </CardContent>
        {/* Optional Footer */}
        {/* <CardFooter>
           <p className="text-xs text-muted-foreground">
             Changes might take a few moments to reflect.
           </p>
         </CardFooter> */}
      </Card>

      {/* Add other settings sections here (e.g., Profile, Notifications) */}
    </div>
  );
}
