import useThreads from "@/hooks/useThreads";
import React, { ComponentProps } from "react";
import { format, formatDistance, formatDistanceToNow } from "date-fns";
import { Thread } from "@prisma/client";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import { Badge } from "@/components/ui/badge";

type Props = {};

function getBadgeVariantFromLabel(
  label: string,
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }
  return "secondary";
}

const ThreadList = (props: Props) => {
  const { threads, threadId, setThreadId } = useThreads();
  const groupedThread = threads?.reduce(
    (acc, thread) => {
      const date = format(thread.email[0]?.sentAt ?? new Date(), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(thread);
      return acc;
    },
    {} as Record<string, typeof threads>,
  );

  return (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-auto">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {Object.entries(groupedThread ?? {})?.map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="text-muted-foreground mt-5 text-xs font-medium first:mt-0">
              {date}
            </div>
            {threads?.map((thread) => {
              return (
                <button
                  key={thread?.id}
                  onClick={() => setThreadId(thread?.id)}
                  className={cn(
                    "relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                    threadId === thread.id && "bg-muted",
                  )}
                >
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">
                          {thread.email.at(-1)?.from?.name || thread?.subject}
                        </div>
                      </div>
                      <div className={cn("ml-auto text-xs")}>
                        {formatDistanceToNow(
                          thread.email.at(-1)?.sentAt ?? new Date(),
                          {
                            addSuffix: true,
                          },
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-medium">{thread?.subject}</div>
                  </div>
                  <div
                    className="text-muted-foreground line-clamp-2 text-xs"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        thread.email?.at(-1)?.bodySnippet ?? "",
                        {
                          USE_PROFILES: { html: true },
                        },
                      ),
                    }}
                  ></div>
                  {thread.email[0]?.sysLabels?.length && (
                    <div className="flex items-center gap-2">
                      {thread.email[0]?.sysLabels.map((label) => (
                        <Badge
                          key={label}
                          variant={getBadgeVariantFromLabel(label)}
                          className="capitalize"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ThreadList;
