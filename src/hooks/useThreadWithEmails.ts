import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { useAtom } from "jotai";
import { threadIdAtom } from "./useThreads";

const useThreadWithEmails = () => {
  const [accountId] = useLocalStorage("accountId", "");
  const [threadId] = useAtom(threadIdAtom);

  const {
    data: threadWithEmails,
    isLoading,
    refetch,
  } = api.account.getThreadWithEmails.useQuery(
    {
      accountId,
      threadId: threadId || "",
    },
    {
      enabled: !!accountId && !!threadId,
      refetchOnWindowFocus: false,
    },
  );

  return {
    threadWithEmails,
    isLoading,
    refetch,
  };
};

export default useThreadWithEmails;
