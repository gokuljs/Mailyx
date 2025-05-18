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
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import useSubscriptionInfo from "@/hooks/useSubscriptionInfo";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useState } from "react";
import ChangePlanModal from "@/components/settings/ChangePlanModal";
import DeleteAccountModal from "@/components/settings/DeleteAccountModal";

export default function SettingsPage() {
  const router = useRouter();
  const { subInfo, isLoading, isSubscribed } = useSubscriptionInfo();
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [deleteAccountData, setDeleteAccountData] = useState<{
    isOpen: boolean;
    accountId: string;
    accountEmail: string;
  }>({
    isOpen: false,
    accountId: "",
    accountEmail: "",
  });

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

  const { data: accounts, refetch: refetchAccounts } =
    api.account.getAccounts.useQuery();

  const openCustomerPortal = async () => {
    if (!subInfo) return;
    try {
      await mutate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAccount = (accountId: string, accountEmail: string) => {
    setDeleteAccountData({
      isOpen: true,
      accountId,
      accountEmail,
    });
  };

  const closeDeleteModal = () => {
    setDeleteAccountData({
      isOpen: false,
      accountId: "",
      accountEmail: "",
    });
  };

  const handleDeleteSuccess = () => {
    refetchAccounts();
  };

  return (
    <div className="min-h-screen space-y-6 p-4 pb-16 md:p-10 dark:bg-[hsl(20_14.3%_4.1%)]">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 cursor-pointer px-2 text-sm"
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

      {/* Connected Accounts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your connected email accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts && accounts.length > 0 ? (
            <div className="space-y-4">
              <h3 className="mb-2 text-lg font-medium">Your Email Accounts</h3>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {account.emailAddress}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        handleDeleteAccount(account.id, account.emailAddress)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                Deleting an account will remove all emails and data associated
                with it.
              </p>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-muted-foreground">No accounts connected</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => router.push("/mail")}
              >
                Connect an account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
              variant="outline"
              disabled={!subInfo || isPending || isLoading}
              onClick={openCustomerPortal}
              className="flex w-fit items-center justify-center"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
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
            <Button
              disabled={!isSubscribed}
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsChangePlanModalOpen(true)}
            >
              Change Subscription Plan
            </Button>
            {/* Or link to pricing page:
             <Button asChild variant="outline">
               <Link href="/pricing">View Plans</Link>
             </Button>
             */}
            {isChangePlanModalOpen && subInfo && (
              <ChangePlanModal
                isOpen={isChangePlanModalOpen}
                onClose={() => setIsChangePlanModalOpen(false)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Modal */}
      {deleteAccountData.isOpen && (
        <DeleteAccountModal
          isOpen={deleteAccountData.isOpen}
          onClose={closeDeleteModal}
          accountId={deleteAccountData.accountId}
          accountEmail={deleteAccountData.accountEmail}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
