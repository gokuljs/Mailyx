import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useThreads = () => {
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage("mailyx-tab", "inbox");
  const [done] = useLocalStorage("mailyx-done", false);
  const { data: accounts } = api.account.getAccounts.useQuery();
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
      enabled: !!accountId && !!tab,
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
  };
};

export default useThreads;
