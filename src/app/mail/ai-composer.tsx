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
import { Bot } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "./actions";
import { readStreamableValue } from "ai/rsc";

type Props = {
  isComposing: boolean;
  onGenerate: (token: string) => void;
};

const AiComposer = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const aiGenerate = async () => {
    console.log("Starting Generation");
    const { output } = await generateEmail("", prompt);
    for await (const token of readStreamableValue(output)) {
      if (token) {
        props.onGenerate(token);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false);
      }}
    >
      <Button size="icon" variant={"outline"} onClick={() => setOpen(true)}>
        <Bot className="size-5" />
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
