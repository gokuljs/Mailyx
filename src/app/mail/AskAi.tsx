import React from "react";
import { AnimatePresence, motion, spring } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { icons, SendIcon } from "lucide-react";

type Props = {
  isCollapsed: boolean;
};

const AskAi = ({ isCollapsed }: Props) => {
  const messages: any[] = [];
  if (isCollapsed) return null;
  return (
    <div className="mb-14 p-4 text-white">
      <motion.div className="flex flex-1 flex-col items-end rounded-lg bg-gray-100 pb-4 shadow-inner dark:bg-gray-900">
        <div
          className="flex max-h-[50vh] w-full flex-col gap-2 overflow-y-scroll"
          id="message-container"
        >
          <AnimatePresence mode="wait">
            {messages.map((message) => {
              return (
                <motion.div
                  key={message.id}
                  layout="position"
                  className={cn(
                    "z-10 mt-2 max-w-[250px] rounded-2xl bg-gray-200 break-words dark:bg-gray-800",
                    {
                      "self-end text-gray-900 dark:text-gray-100":
                        message.role === "user",
                    },
                  )}
                  layoutId={`container-${messages.length}`}
                  transition={{
                    type: "spring",
                    duration: 0.2,
                  }}
                >
                  <div className="px-3 py-2 text-[15px] leading-[15px]">
                    {message.content}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <div className="flex w-full">
          <form className="flex w-full px-1 py-2">
            <Input
              className="relative h-9 flex-grow rounded-md border border-gray-200 bg-white px-3 py-1 text-[15px] text-black outline-none placeholder:text-[13px] dark:text-white"
              placeholder="Ask Ai"
            />
            <motion.div
              key={messages.length}
              layout={"position"}
              layoutId={`container-${messages.length}`}
              transition={{
                type: spring,
                duration: 0.2,
              }}
              initial={{
                opacity: 0.6,
                zIndex: -1,
              }}
              animate={{
                opacity: 0.6,
                zIndex: -1,
              }}
              exit={{
                opacity: 1,
                zIndex: 1,
              }}
            >
              <div className="px-2 py-2 text-[15px] leading-[15px] text-gray-900 dark:text-gray-100"></div>
            </motion.div>
            <Button
              variant={"secondary"}
              size={"icon"}
              className="rounded-full"
            >
              <SendIcon className="size-4 text-orange-500" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AskAi;
