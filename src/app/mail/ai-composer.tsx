import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Sparkle, SparklesIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "./actions";
import { readStreamableValue } from "ai/rsc";
import useThreads from "@/hooks/useThreads";
import { turndown } from "@/lib/turndown";

type Props = {
  isComposing: boolean;
  onGenerate: (token: string) => void;
};

const AiComposer = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { threads, threadId, account } = useThreads();
  const thread = threads?.find((item) => item?.id === threadId);
  const aiGenerate = async () => {
    try {
      let context = "";
      context =
        thread?.email
          .map(
            (m) =>
              `Subject: ${m?.subject}\nFrom: ${m?.from?.address}\n\n${turndown.turndown(m?.body ?? m?.bodySnippet ?? "")}`,
          )
          .join("\n") || "";

      context =
        context +
        `
      My name is ${account?.name}
    `;

      const { output } = await generateEmail(context, prompt);
      for await (const token of readStreamableValue(output)) {
        if (token) {
          props.onGenerate(token);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false);
      }}
    >
      <Button
        size="icon"
        className="rounded-4xlFi cursor-pointer"
        variant={"ghost"}
        onClick={() => setOpen(true)}
      >
        <SparklesIcon className="size-4 text-amber-500" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Smart Compose</DialogTitle>
          <DialogDescription>
            Ai will Help you compose your email
          </DialogDescription>
          <div className="h-2"></div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt"
          />
          <div className="h-2"></div>
          <Button
            onClick={() => {
              aiGenerate();
              setOpen(false);
              setPrompt("");
            }}
          >
            Generate
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AiComposer;
