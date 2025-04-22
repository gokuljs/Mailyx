"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAurinkoAuthUrl } from "@/lib/aruinko";
import { api } from "@/trpc/react";
import { Plus, Inbox } from "lucide-react";

export function EmptyAccounts() {
  const { data: accounts } = api.account.getAccounts.useQuery();
  console.log({ accounts });
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
              const url = await getAurinkoAuthUrl("Google");
              console.log(url);
              if (url) window.location.href = url;
            }}
            className="cursor-pointer"
          >
            Connect account
            <Plus />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
