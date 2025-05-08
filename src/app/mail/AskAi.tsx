"use client";
import { useChat } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { Loader, Send, SparklesIcon } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import PremiumBanner from "./PremiumBanner";
import { api } from "@/trpc/react";

const transitionDebug = {
  type: "easeOut",
  duration: 0.2,
};
const AskAI = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const [accountId] = useLocalStorage("accountId", "");
  const containerRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();
  const { input, handleInputChange, handleSubmit, messages, isLoading } =
    useChat({
      api: "/api/chat",
      body: {
        accountId,
      },
      onError: (error) => {
        if (error.message.includes("Limit reached")) {
          toast.error(
            "You have reached the limit for today. Please upgrade to pro to ask as many questions as you want",
          );
        }
      },
      onFinish: () => {
        utils.account.chatBotInteraction.invalidate();
      },
      initialMessages: [],
    });

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth", // or 'auto' if you don’t want animation
      });
    }
  }, [messages]);
  console.log(messages);

  if (isCollapsed) return null;
  return (
    <div className="mb-14 p-1">
      <PremiumBanner />
      <div className="h-4"></div>
      <motion.div className="flex max-h-[420px] flex-1 flex-col items-end justify-end rounded-lg border bg-white p-2 pb-4 shadow-zinc-950 dark:bg-stone-950">
        <div
          ref={containerRef}
          className="flex max-h-[50vh] w-full flex-col gap-2 overflow-y-scroll"
          id="message-container"
        >
          <AnimatePresence mode="wait">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                layout="position"
                className={cn(
                  "z-10 mt-2 max-w-[350px] rounded-lg p-1 break-words shadow-sm transition-all",
                  {
                    "self-end rounded-br-none bg-zinc-900 text-gray-100 dark:bg-zinc-800":
                      message.role === "user",
                    "self-start rounded-bl-none bg-zinc-700 text-gray-200 dark:bg-zinc-700":
                      message.role === "assistant",
                  },
                )}
                layoutId={`container-[${messages.length - 1}]`}
                transition={transitionDebug}
              >
                <div className="px-1 py-2 text-[15px] leading-[15px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {messages.length > 0 && <div className="h-4"></div>}
        <div className="w-full">
          {messages.length === 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <SparklesIcon className="size-6 text-zinc-700 dark:text-zinc-500" />
                <div>
                  <p className="text-black dark:text-zinc-300">
                    Ask AI anything about your emails
                  </p>
                  <p className="dark:text-muted-foreground text-xs text-zinc-700">
                    Get answers to your questions about your emails
                  </p>
                </div>
              </div>
              <div className="h-2"></div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  onClick={() =>
                    handleInputChange({
                      target: { value: "What can I ask?" } as HTMLInputElement,
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-gray-200 dark:bg-stone-600 dark:text-white/80"
                >
                  What can I ask?
                </span>
                <span
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value: "When is my next flight?",
                      } as HTMLInputElement,
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-gray-200 dark:bg-stone-600 dark:text-white/80"
                >
                  When is my next flight?
                </span>
                <span
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value: "When is my next meeting?",
                      } as HTMLInputElement,
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-gray-200 dark:bg-stone-600 dark:text-white/80"
                >
                  When is my next meeting?
                </span>
              </div>
            </div>
          )}
          {isLoading && <div className="text-muted-foreground">Loading...</div>}
          <form onSubmit={handleSubmit} className="mt-1 flex w-full gap-2">
            <Input
              type="text"
              onChange={handleInputChange}
              value={input}
              className="relative h-9 w-[calc(100%-35px)] flex-grow rounded-sm border border-zinc-300 bg-white px-3 text-[15px] outline-zinc-800 outline-none placeholder:text-[13px] placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-blue-500/20 focus-visible:ring-offset-1 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-400 dark:focus-visible:ring-blue-500/20 dark:focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-700"
              placeholder="Ask AI anything about your emails"
            />
            <motion.div
              key={messages.length}
              layout="position"
              className="pointer-events-none absolute z-10 flex h-9 w-[250px] items-center overflow-hidden rounded-full bg-gray-200 break-words [word-break:break-word] dark:bg-gray-800"
              layoutId={`container-[${messages.length}]`}
              transition={transitionDebug}
              initial={{ opacity: 0.6, zIndex: -1 }}
              animate={{ opacity: 0.6, zIndex: -1 }}
              exit={{ opacity: 1, zIndex: 1 }}
            >
              <div className="px-3 py-2 text-[15px] leading-[15px] text-gray-900 dark:text-gray-100">
                {input}
              </div>
            </motion.div>
            <Button
              size={"icon"}
              type="submit"
              className="flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-full bg-zinc-950 hover:!bg-zinc-700"
            >
              <Send className="size-4 text-stone-400 dark:text-gray-300" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AskAI;
