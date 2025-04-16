"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useThreads from "@/hooks/useThreads";
import { Archive, ArchiveX, Clock, MoreVertical, Trash2 } from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { format } from "date-fns";

type Props = {};

const ThreadDisplay = (props: Props) => {
  const { threadId, threads } = useThreads();
  const thread = threads?.find((item) => item?.id === threadId);
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
      {thread ? (
        <div className="flex flex-1 flex-col overflow-scroll">
          <div className="flex items-center p-4">
            <div className="flex items-center gap-4 text-sm">
              <Avatar className="bg-muted text-muted-foreground flex items-center justify-center">
                <AvatarImage />
                <AvatarFallback>
                  {thread.email[0]?.from?.name?.[0] ||
                    thread.email[0]?.subject?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold text-gray-800 dark:text-gray-100">
                  {thread?.email[0]?.from?.name}
                  <div className="line-clamp-1 text-xs text-gray-600 dark:text-gray-400">
                    {thread?.email[0]?.subject}
                  </div>
                  <div className="line-clamp-1 flex gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Reply-to:
                    </span>
                    <span className="dark:text-gray-200">
                      {thread?.email[0]?.from?.address}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {thread?.email[0]?.sentAt && (
              <div className="text-muted-foreground ml-auto text-xs">
                {format(new Date(thread?.email[0]?.sentAt), "PPpp")}
              </div>
            )}
          </div>
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
