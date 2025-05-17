import React, { ComponentProps, useEffect, useMemo, useRef } from "react";
import { formatLocalDateTime } from "@/lib/timeAgointimeZone";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import { Badge } from "@/components/ui/badge";
import { thread } from "@/drizzle/schema";
import { type InferSelectModel } from "drizzle-orm";
import { getTimeAgoInLocalTimezone } from "@/lib/timeAgointimeZone";
import { useAtom } from "jotai";
import { isSearchingAtom, searchValueAtom } from "./SearchBar";
import { api } from "@/trpc/react";
import { useDebounceValue } from "usehooks-ts";
import useThreads from "@/hooks/useThreads";
import { threadIdAtom } from "@/hooks/useThreads";

// Define the Thread type using Drizzle schema
type Thread = InferSelectModel<typeof thread>;

type Props = {};

function getBadgeVariantFromLabel(
  label: string,
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }
  return "secondary";
}

const SearchThreadList = (props: Props) => {
  const [searchValue] = useAtom(searchValueAtom);
  const [isSearching, setIsSearching] = useAtom(isSearchingAtom);
  const { threads, threadId, setThreadId } = useThreads();
  const search = api.account.searchEmails.useMutation();
  const [debounceSearchValue] = useDebounceValue(searchValue, 1000);
  const { accountId } = useThreads();
  useEffect(() => {
    if (!debounceSearchValue || !accountId) return;
    search.mutate({ accountId, query: debounceSearchValue });
  }, [debounceSearchValue, accountId]);

  const groupedThread = useMemo(() => {
    return search.data?.reduce(
      (acc, thread) => {
        const date = formatLocalDateTime(
          thread.email[0]?.sentAt ?? new Date(),
          "yyyy-MM-dd",
        );
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(thread);
        return acc;
      },
      {} as Record<string, typeof threads>,
    );
  }, [search?.data]);

  if (search.isPending) {
    return (
      <div className="text-muted-foreground flex min-h-[calc(100vh-120px)] items-center justify-center border p-8 text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          <p>Searching emails for &ldquo;{debounceSearchValue}&rdquo;...</p>
        </div>
      </div>
    );
  }
  if (!search.data?.length) {
    return (
      <div className="text-muted-foreground flex min-h-[calc(100vh-120px)] items-center justify-center p-8 text-sm">
        <div>No results found for &ldquo;{debounceSearchValue}&rdquo;</div>
      </div>
    );
  }
  return (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-auto">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {search?.data?.map((thread) => {
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
                      {thread.email.at(-1)?.from?.name ||
                        thread?.subject ||
                        "(No Subject)"}
                    </div>
                  </div>
                  <div className={cn("ml-auto text-xs")}>
                    {getTimeAgoInLocalTimezone(
                      thread.email.at(-1)?.sentAt ?? new Date(),
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
                  {thread.email[0]?.sysLabels.map((label: string) => (
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
      </div>
    </div>
  );
};

export default SearchThreadList;
