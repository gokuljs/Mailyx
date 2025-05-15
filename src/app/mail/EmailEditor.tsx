import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Text } from "@tiptap/extension-text";
import EditorMenuBar from "./editorMenuBar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import TagInput from "./TagInput";
import { Input } from "@/components/ui/input";
import AiComposer from "./ai-composer";
import { generate } from "./actions";
import { readStreamableValue } from "ai/rsc";
import useThreads from "@/hooks/useThreads";
import { turndown } from "@/lib/turndown";

type Props = {
  subject: string;
  setSubject: (value: string) => void;
  toValues: { label: string; value: string }[];
  setToValues: (value: { label: string; value: string }[]) => void;
  ccValues: { label: string; value: string }[];
  setCCValues: (value: { label: string; value: string }[]) => void;
  to: string[];
  handleSend: (value: string) => void;
  isSending: boolean;
  defaultToolbarExpanded?: boolean;
};

const EmailEditor = ({
  subject,
  setSubject,
  toValues,
  setToValues,
  ccValues,
  setCCValues,
  to,
  handleSend,
  isSending,
  defaultToolbarExpanded = false,
}: Props) => {
  const [value, setValue] = useState("");
  const [expanded, setExpanded] = useState(defaultToolbarExpanded);
  const { threads, threadId, account } = useThreads();
  const thread = threads?.find((item) => item?.id === threadId);
  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          const current = this.editor.getText();
          aiGenerate(current, this.editor);
          return true;
        },
      };
    },
  });
  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit, customText],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
  });
  const aiGenerate = async (value: string, editor: any) => {
    let context = "";
    for (const email of thread?.email ?? []) {
      const content = `
      Subject: ${email.subject}
      From : ${email.from}
      Sent: ${new Date(email.sentAt).toLocaleString()}
      Body: ${turndown.turndown(email?.body ?? email.bodySnippet ?? "")}
      `;
      context = context + content;
    }
    context =
      context +
      `My name is ${account?.name} and my email is ${account?.emailAddress}`;
    const { output } = await generate(value);
    let outputTest = "";
    editor?.commands?.insertContent("");
    for await (const token of readStreamableValue(output)) {
      if (token) {
        console.log({ editor, token });
        editor?.commands?.insertContent(token);
        outputTest += token;
      }
    }
  };

  const onGenerate = (token: String) => {
    editor?.commands?.insertContent(token);
  };

  if (!editor) return <></>;

  return (
    <div>
      <div className="flex min-h-[120px] flex-col justify-between border">
        <div className="flex border-b p-4 py-2">
          <EditorMenuBar editor={editor} />
        </div>
        <div className="space-y-2 p-4 pb-0">
          {expanded && (
            <>
              <TagInput
                label="To"
                onChange={setToValues}
                placeholder="Add Recipients"
                value={toValues}
              />
              <TagInput
                label="CC"
                onChange={setCCValues}
                placeholder="Add Recipients"
                value={ccValues}
              />
              <Input
                id="subject"
                placeholder="subject"
                value={subject}
                onChange={(e) => setSubject(e.target?.value)}
              />
            </>
          )}
          <div className="flex items-center gap-2">
            <div
              className="flex cursor-pointer gap-1"
              onClick={() => {
                setExpanded(!expanded);
              }}
            >
              <span className="font-medium text-green-600">Draft</span>
              <span className="font-medium"> to {to?.join(", ")}</span>
            </div>
            <AiComposer
              isComposing={defaultToolbarExpanded}
              onGenerate={onGenerate}
            />
          </div>
        </div>
        <div className="prose w-full flex-1">
          <EditorContent editor={editor} value={value} />
        </div>
        <Separator />
        <div className="mt-auto flex items-center justify-between px-4 py-4">
          <span className="text-sm">
            Tip: Press{" "}
            <kbd className="py-1.6 rounded-lg border border-gray-200 bg-gray-100 px-2 text-xs font-semibold text-gray-800">
              Cmd + J
            </kbd>{" "}
            For Ai Auto Complete
          </span>
          <Button
            onClick={async () => {
              editor?.commands?.clearContent();
              await handleSend(value);
            }}
            className="cursor-pointer"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailEditor;
