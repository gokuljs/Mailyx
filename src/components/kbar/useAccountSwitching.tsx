import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useRegisterActions } from "kbar";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useAccountSwitching = () => {
  const { isSignedIn } = useUser();
  const { data: accounts } = api.account.getAccounts.useQuery(undefined, {
    enabled: !!isSignedIn,
  });

  const [_, setAccountId] = useLocalStorage("accountId", "");

  const mainAction = [
    {
      id: "accountsAction",
      name: "Switch Account",
      shortcut: ["e", "s"],
      section: "Accounts",
    },
  ];

  useRegisterActions(
    mainAction.concat(
      accounts?.map((account) => {
        return {
          id: account?.id,
          name: account?.name,
          parent: "accountsAction",
          performa: () => {
            setAccountId(account.id);
          },
          keywords: [account.name, account.emailAddress].filter(
            Boolean,
          ) as string[],
          shortcut: [],
          section: "",
          subtitle: account.emailAddress,
          priority: 1000,
        };
      }) || [],
    ),
    [accounts],
  );
  return <div>useAccountSwitching</div>;
};

export default useAccountSwitching;
