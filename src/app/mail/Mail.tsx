"use client";
import React, { useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import AccountSwitcher from "./account-switcher";
import SideBar from "./SideBar";
import ThreadList from "./thread-list";
import ThreadDisplay from "./ThreadDisplay";
import { useDebounceValue, useLocalStorage } from "usehooks-ts";
import SearchBar, { isSearchingAtom, searchValueAtom } from "./SearchBar";
import SearchThreadList from "./SearchThreadList";
import AskAi from "./AskAi";
import { api } from "@/trpc/react";

import { EmptyAccounts } from "./EmptyAccounts";
import { useUser } from "@clerk/nextjs";
import { useAtom } from "jotai";
import useThreads from "@/hooks/useThreads";

type Props = {
  defaultLayout: number[] | undefined;
  navCollapsedSize: number;
  defaultCollapsed: boolean;
};

function Mail({
  defaultLayout = [20, 32, 50],
  navCollapsedSize,
  defaultCollapsed,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [done, setDone] = useLocalStorage("mailyx-done", false);
  const { isSignedIn } = useUser();
  const { data: accounts } = api.account.getAccounts.useQuery(undefined, {
    enabled: isSignedIn,
  });
  const [minSizes, setMinSizes] = useState([25, 30, 30]); // Default sizes

  const [isSearching, setIsSearching] = useAtom(isSearchingAtom);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        // Ensure window is defined (for SSR)
        if (window.innerWidth <= 1200) {
          setMinSizes([25, 40, 40]);
        } else {
          setMinSizes([20, 40, 40]);
        }
      }
    };

    // Set initial sizes
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          console.log(sizes);
        }}
        className="h-full min-h-screen items-stretch dark:bg-[hsl(20_14.3%_4.1%)]"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          minSize={minSizes[0]}
          maxSize={40}
          onCollapse={() => {
            setIsCollapsed(true);
          }}
          onResize={() => {
            setIsCollapsed(false);
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <div className="flex h-full flex-1 flex-col">
            <div
              className={cn(
                "flex h-[52px] items-center justify-between",
                isCollapsed ? "h-[52px]" : "px-2",
              )}
            >
              {/* Account Switcher */}
              <AccountSwitcher isCollapsed={isCollapsed} />
            </div>
            <Separator />
            {/* sidebar */}
            <SideBar isCollapsed={isCollapsed} />
            {/* Ask Ai */}
            <AskAi isCollapsed={isCollapsed} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={minSizes[1]}>
          <Tabs
            defaultValue="inbox"
            value={done ? "done" : "inbox"}
            onValueChange={(tab) => {
              if (tab === "done") {
                setDone(true);
              } else {
                setDone(false);
              }
            }}
            className="gap-0"
          >
            <div className="mb-0 flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="inbox"
                  className="text-xinc-100 dark:text-zinc-600"
                >
                  Inbox
                </TabsTrigger>
                <TabsTrigger
                  value="done"
                  className="text-xinc-100 dark:text-zinc-600"
                >
                  Done
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            {/* search Bar */}
            {accounts && accounts.length > 0 && <SearchBar />}

            {isSearching && <SearchThreadList />}

            {accounts && accounts.length === 0 && !isSearching ? (
              <EmptyAccounts />
            ) : (
              <>
                {!isSearching && (
                  <>
                    <TabsContent value="inbox">
                      {" "}
                      <ThreadList />
                    </TabsContent>
                    <TabsContent value="done">
                      {" "}
                      <ThreadList />
                    </TabsContent>
                  </>
                )}
              </>
            )}
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={minSizes[2]}>
          <ThreadDisplay />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}

export default Mail;
