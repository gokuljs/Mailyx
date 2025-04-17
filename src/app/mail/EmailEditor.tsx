import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Text } from "@tiptap/extension-text";
import EditorMenuBar from "./editorMenuBar";

type Props = {};

const EmailEditor = (props: Props) => {
  const [value, setValue] = useState("");
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
      <div>
        <EditorMenuBar editor={editor} />
        <EditorContent editor={editor} value={value} />
      </div>
    </div>
  );
};

export default EmailEditor;
