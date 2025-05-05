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
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  // TODO: Fetch user subscription status and details

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
              View your payment history, update payment methods, or cancel your
              subscription through our secure customer portal.
            </p>
            {/* TODO: Replace "#" with the actual customer portal link */}
            <Button asChild variant="outline">
              <Link href="#">Go to Customer Portal</Link>
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
