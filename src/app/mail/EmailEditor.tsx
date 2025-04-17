import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Text } from "@tiptap/extension-text";
import EditorMenuBar from "./editorMenuBar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import TagInput from "./TagInput";
import { Input } from "@/components/ui/input";

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
  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          console.log("cmd-j");
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
                onChange={console.log}
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
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailEditor;
