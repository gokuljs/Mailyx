"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import React, { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useUser } from "@clerk/clerk-react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { getAurinkoAuthUrl } from "@/lib/aruinko";
import useSubscriptionInfo from "@/hooks/useSubscriptionInfo";

type Props = {
  isCollapsed: boolean;
};

export default function AccountSwitcher({ isCollapsed }: Props) {
  const { isSignedIn } = useUser();
  const { data: accounts } = api.account.getAccounts.useQuery(undefined, {
    enabled: isSignedIn,
  });
  const { isSubscribed, isLoading } = useSubscriptionInfo();
  const [accountId, setAccountId] = useLocalStorage("accountId", "");
  if (!accounts) return null;
  return (
    <div className="flex w-full items-center gap-2">
      <Select defaultValue={accountId} onValueChange={setAccountId}>
        <SelectTrigger
          className={cn(
            "flex w-full flex-1 items-center gap-2 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate",
            isCollapsed &&
              "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden",
          )}
          aria-label="Select account"
        >
          <SelectValue placeholder="Select an account">
            <span className={cn({ hidden: !isCollapsed })}>
              {
                accounts.find((account) => account.id === accountId)
                  ?.emailAddress[0]
              }
            </span>
            <span className={cn("ml-2", isCollapsed && "hidden")}>
              {
                accounts.find((account) => account.id === accountId)
                  ?.emailAddress
              }
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="[&_svg]:text-foreground flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0">
                {account.emailAddress}
              </div>
            </SelectItem>
          ))}
          <div
            onClick={async () => {
              try {
                const url = await getAurinkoAuthUrl("Google", isSubscribed);
                if (url) window.location.href = url;
              } catch (error) {
                toast.error((error as Error).message);
              }
            }}
            className="flex cursor-pointer items-center gap-3 px-2 py-1"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add account
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
