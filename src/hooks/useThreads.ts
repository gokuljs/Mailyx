import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";

export const threadIdAtom = atom<string | null>(null);

const useThreads = () => {
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage("mailyx-tab", "inbox");
  const [done] = useLocalStorage("mailyx-done", false);
  const { data: accounts } = api.account.getAccounts.useQuery();
  const [threadId, setThreadId] = useAtom(threadIdAtom);
  console.log({ accountId }, "ssss");
  const {
    data: threads,
    isFetching,
    refetch,
  } = api.account.getThreads.useQuery(
    {
      accountId,
      tab,
      done,
    },
    {
      enabled: !!accountId && !!tab && accounts && accounts.length > 0,
      placeholderData: (e) => e,
      refetchInterval: 5000,
    },
  );

  return {
    threads,
    isFetching,
    refetch,
    accountId,
    account: accounts?.find((item) => item?.id === accountId),
    threadId,
    setThreadId,
  };
};

export default useThreads;
