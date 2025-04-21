import React from "react";
import { AnimatePresence, motion, spring } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { icons, SendIcon, SparklesIcon } from "lucide-react";
import { useChat } from "ai/react";
import useThreads from "@/hooks/useThreads";
import { error } from "console";

type Props = {
  isCollapsed: boolean;
};

const AskAi = ({ isCollapsed }: Props) => {
  const { accountId } = useThreads();
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      accountId: "",
    },
    onError: (error) => {
      console.log(error);
    },
  });
  if (isCollapsed) return null;
  return (
    <div className="mb-14 p-4">
      <motion.div className="flex flex-1 flex-col items-end rounded-xl bg-white p-4 pb-4 shadow shadow-zinc-800 dark:bg-zinc-950">
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
        {messages.length > 0 && <div className="h-4"></div>}
        <div className="w-full">
          {messages.length === 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <SparklesIcon className="size-6 text-gray-500" />
                <div>
                  <p className="text-gray-900 dark:text-gray-100">
                    Ask AI anything about your emails
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get answers to your questions about your emails
                  </p>
                </div>
              </div>
              <div className="h-2"></div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value: "What can I ask?",
                      },
                    })
                  }
                  className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                >
                  What can I ask?
                </span>
                <span
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value: "When is my next flight?",
                      },
                    })
                  }
                  className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                >
                  When is my next flight?
                </span>
                <span
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value: "When is my next meeting?",
                      },
                    })
                  }
                  className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                >
                  When is my next meeting?
                </span>
              </div>
            </div>
          )}
          <form className="flex w-full px-1 py-2" onSubmit={handleSubmit}>
            <Input
              className="relative h-9 flex-grow rounded-md border border-gray-200 bg-white px-3 py-1 text-[15px] text-black outline-none placeholder:text-[13px] dark:text-white"
              placeholder="Ask Ai"
              value={input}
              onChange={handleInputChange}
            />
            <motion.div
              className="break-word pointer-events-none absolute z-10 h-9 w-[250px] items-center overflow-hidden rounded-md bg-green-200 break-words [word-break:break-word] dark:bg-gray-800"
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
              <div className="px-2 py-2 text-[15px] leading-[15px] text-gray-900 dark:text-gray-100">
                {input}
              </div>
            </motion.div>
            <Button
              variant={"secondary"}
              size={"icon"}
              className="ml-1 rounded-full bg-zinc-700 hover:border hover:border-amber-600 hover:shadow-amber-400"
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
