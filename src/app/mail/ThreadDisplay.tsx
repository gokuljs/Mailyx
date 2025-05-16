"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useThreads from "@/hooks/useThreads";
import useThreadWithEmails from "@/hooks/useThreadWithEmails";
import { Archive, ArchiveX, Clock, MoreVertical, Trash2 } from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { format } from "date-fns";
import EmailDisplay from "./EmailDisplay";
import ReplyBox from "./ReplyBox";
import { useAtom } from "jotai";
import { isSearchingAtom } from "./SearchBar";
import SearchDisplay from "./SearchDisplay";
import { api } from "@/trpc/react";

type Props = {};

const ThreadDisplay = (props: Props) => {
  const { threadId, threads, accountId } = useThreads();
  const { threadWithEmails, isLoading } = useThreadWithEmails();
  const { data: replyDetails } = api.account.getReplyDetails.useQuery(
    {
      accountId,
      threadId: threadId ?? "",
    },
    {
      enabled: !!accountId && !!threadId,
    },
  );

  const thread = threadId
    ? threadWithEmails || threads?.find((item) => item?.id === threadId)
    : null;
  const [isSearching] = useAtom(isSearchingAtom);

  // Use the full thread data when available, fallback to preview otherwise
  const displayThread = threadWithEmails || thread;

  return (
    <div className="flex h-full flex-col">
      <div className="col-2 flex items-center p-2">
        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <Archive className="size-4" />
          </Button>
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <ArchiveX className="size-4" />
          </Button>
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <Trash2 className="size-4" />
          </Button>
          <Separator orientation="vertical" />
          <Button
            className="ml-2"
            variant={"ghost"}
            size={"icon"}
            disabled={!thread}
          >
            <Clock className="size-4" />
          </Button>
        </div>
        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} size={"icon"} disabled={!thread}>
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Star thread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Mute Thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />
      {isSearching ? (
        <SearchDisplay />
      ) : (
        <>
          {thread ? (
            <></>
          ) : (
            <div className="text-muted-foreground p-8 text-center">
              <div>No message deleted</div>
            </div>
          )}
        </>
      )}
      {displayThread ? (
        <div className="scrollbar-hide relative flex flex-1 flex-col overflow-scroll">
          <div className="flex items-center p-4">
            <div className="flex items-center gap-4 text-sm">
              <Avatar className="bg-muted text-muted-foreground flex items-center justify-center">
                <AvatarImage />
                <AvatarFallback>
                  {displayThread.email[0]?.from?.name?.[0] ||
                    displayThread.email[0]?.subject?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold text-gray-800 dark:text-gray-100">
                  {displayThread?.email[0]?.from?.name}
                  <div className="line-clamp-1 text-xs text-gray-600 dark:text-gray-400">
                    {displayThread?.email[0]?.subject}
                  </div>
                  <div className="line-clamp-1 flex gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Reply-to:
                    </span>
                    <span className="dark:text-gray-200">
                      {displayThread?.email[0]?.from?.address}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {displayThread?.email[0]?.sentAt && (
              <div className="text-muted-foreground ml-auto text-xs">
                {format(new Date(displayThread?.email[0]?.sentAt), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          <div className="scrollbar-hide flex max-h-[calc(100vh_-_500px)] flex-col overflow-y-auto pb-[200px]">
            {isLoading && !threadWithEmails ? (
              <div className="flex h-40 items-center justify-center">
                <div className="text-muted-foreground text-sm">
                  Loading full message content...
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 p-6">
                {displayThread?.email?.map((email) => {
                  return <EmailDisplay key={email?.id} email={email} />;
                })}
              </div>
            )}
          </div>
          <div className="flex-1"></div>
          <Separator />
          <div className="absolute bottom-0 left-0 z-20 w-full bg-white dark:bg-[hsl(20_14.3%_4.1%)]">
            <ReplyBox replyDetails={replyDetails} />
          </div>
          t
        </div>
      ) : (
        <>
          <div className="text-muted from-foreground flex h-full flex-col items-center justify-center p-8 text-center text-lg">
            📭 <br />
            <span className="text-accent-foreground mt-2 block font-semibold">
              No Message Selected
            </span>
            <p className="text-muted-foreground mt-1 text-sm">
              Please select a message to view its content. 📨
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ThreadDisplay;
