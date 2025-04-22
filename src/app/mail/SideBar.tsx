"use client";
import { File, Inbox, Send } from "lucide-react";
import React from "react";
import { Nav } from "./Nav";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
import useThreads from "@/hooks/useThreads";

type Props = {
  isCollapsed: boolean;
};

const SideBar = ({ isCollapsed }: Props) => {
  const [accountId] = useLocalStorage("accountId", "");
  const { data: accounts } = api.account.getAccounts.useQuery();
  const [tab] = useLocalStorage<"inbox" | "draft" | "sent">(
    "mailyx-tab",
    "inbox",
  );

  const { data: inboxThread } = api.account.getNumThreads.useQuery(
    {
      accountId,
      tab: "inbox",
    },
    {
      enabled: !!(accounts && accounts.length > 0 && accountId),
    },
  );
  const { data: draftThread } = api.account.getNumThreads.useQuery(
    {
      accountId,
      tab: "draft",
    },
    {
      enabled: !!(accounts && accounts.length > 0 && accountId),
    },
  );
  const { data: sentThread } = api.account.getNumThreads.useQuery(
    {
      accountId,
      tab: "sent",
    },
    {
      enabled: !!(accounts && accounts.length > 0 && accountId),
    },
  );

  return (
    <div className="flex-1">
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: "Inbox",
            label: inboxThread?.toString() ?? "0",
            icon: Inbox,
            variant: tab === "inbox" ? "default" : "ghost",
          },
          {
            title: "Draft",
            label: draftThread?.toString() ?? "0",
            icon: File,
            variant: tab === "draft" ? "default" : "ghost",
          },
          {
            title: "Sent",
            label: sentThread?.toString() ?? "0",
            icon: Send,
            variant: tab === "sent" ? "default" : "ghost",
          },
        ]}
      />
    </div>
  );
};

export default SideBar;
