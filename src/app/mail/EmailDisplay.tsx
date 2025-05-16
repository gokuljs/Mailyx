import useThreads from "@/hooks/useThreads";
import { getTimeAgoInLocalTimezone } from "@/lib/timeAgointimeZone";
import { cn } from "@/lib/utils";
import { RouterOutputs } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import Avatar from "react-avatar";
import { Letter } from "react-letter";

type EmailType =
  | RouterOutputs["account"]["getThreads"][0]["email"][0]
  | RouterOutputs["account"]["getThreadWithEmails"]["email"][0];

type Props = {
  email: EmailType;
};

const EmailDisplay = ({ email }: Props) => {
  const { account } = useThreads();
  const isMe = account?.emailAddress === email?.from?.address;

  // Check if we have full body content
  const hasFullContent = "body" in email && !!email.body;

  return (
    <div
      className={cn(
        "w-full rounded-md border p-4 transition-all hover:translate-x-2",
        { "border-1-gray-900 border-1-4": isMe },
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center justify-between gap-2">
          {!isMe && (
            <Avatar
              name={email?.from?.name ?? email?.from?.address}
              email={email?.from?.address}
              size="35"
              textSizeRatio={2}
              round={true}
            />
          )}
          <span className="font-medium">
            {isMe ? "Me" : email?.from?.address}
          </span>
        </div>
        <p className="text-muted-foreground text-xs">
          {getTimeAgoInLocalTimezone(email.sentAt)}
        </p>
      </div>

      {hasFullContent ? (
        <Letter className="rounded-md bg-white text-black" html={email.body} />
      ) : (
        <div className="mt-2 text-sm text-gray-600">
          {email.bodySnippet || "Loading content..."}
        </div>
      )}
    </div>
  );
};

export default EmailDisplay;
