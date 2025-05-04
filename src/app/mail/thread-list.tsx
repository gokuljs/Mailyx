import useThreads from "@/hooks/useThreads";
import React, { ComponentProps } from "react";
import { format, formatDistance, formatDistanceToNow } from "date-fns";
import * as schema from "@/server/db/schema"; // Import schema for type inference
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

// Infer Thread type based on Drizzle schema (adjust if hook returns different shape)
type ThreadWithEmails = typeof schema.threads.$inferSelect & {
  email: (typeof schema.emails.$inferSelect & {
    from: typeof schema.emailAddresses.$inferSelect | null;
  })[]; // Assuming email relation includes from address
};

const ThreadList = (props: Props) => {
  const { threads, threadId, setThreadId } = useThreads(); // threads should match ThreadWithEmails type
  const groupedThread = (threads as ThreadWithEmails[] | undefined)?.reduce(
    (acc, thread) => {
      // Access email data carefully, assuming it exists and has the expected structure
      const firstEmail = thread.email?.[0];
      const lastEmail = thread.email?.at(-1);
      const date = format(firstEmail?.sentAt ?? new Date(), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(thread);
      return acc;
    },
    {} as Record<string, ThreadWithEmails[]>,
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
              // Explicitly type thread here for clarity within the map
              const currentThread = thread as ThreadWithEmails;
              const firstEmail = currentThread.email?.[0];
              const lastEmail = currentThread.email?.at(-1);
              return (
                <button
                  key={currentThread?.id}
                  onClick={() => setThreadId(currentThread?.id)}
                  className={cn(
                    "relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                    threadId === currentThread.id && "bg-muted",
                  )}
                >
                  <div className="flex w-full flex-col gap-2">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">
                          {lastEmail?.from?.name ||
                            currentThread?.subject ||
                            "(No Subject)"}
                        </div>
                      </div>
                      <div className={cn("ml-auto text-xs")}>
                        {formatDistanceToNow(lastEmail?.sentAt ?? new Date(), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <div className="text-xs font-medium">
                      {currentThread?.subject}
                    </div>
                  </div>
                  <div
                    className="text-muted-foreground line-clamp-2 text-xs"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(lastEmail?.bodySnippet ?? "", {
                        USE_PROFILES: { html: true },
                      }),
                    }}
                  ></div>
                  {firstEmail?.sysLabels?.length && (
                    <div className="flex items-center gap-2">
                      {firstEmail?.sysLabels.map((label) => (
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
