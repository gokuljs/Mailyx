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
            <DropdownMenuTrigger>
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
        <></>
      ) : (
        <>
          <div className="text-muted from-foreground flex h-full flex-col items-center justify-center p-8 text-center text-lg">
            📭 <br />
            <span className="mt-2 block font-semibold">
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
