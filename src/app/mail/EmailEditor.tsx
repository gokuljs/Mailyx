import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
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
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  showExpandButton?: boolean;
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
  showExpandButton = true,
}: Props) => {
  const [value, setValue] = useState("");
  const [expanded, setExpanded] = useState(defaultToolbarExpanded);
  const { threads, threadId, account } = useThreads();
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const thread = threads?.find((item) => item?.id === threadId);
  const [lastTypingTime, setLastTypingTime] = useState(0);

  // Define fixed height values for clarity
  const MIN_HEIGHT = 40;
  const MAX_HEIGHT = 200;

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
    content: value || "", // Set initial content
    onTransaction: ({ editor: transactionEditor }) => {
      // Only apply auto-expansion if showExpandButton is true
      if (!showExpandButton) return;

      // This fires on all changes including initial load
      // Use requestAnimationFrame to give DOM time to update
      requestAnimationFrame(() => {
        if (
          editorContainerRef.current &&
          !isManuallyCollapsed &&
          !isManuallyExpanded
        ) {
          const proseMirror =
            editorContainerRef.current.querySelector(".ProseMirror");
          if (proseMirror) {
            // Skip auto-resize for empty content
            if (transactionEditor.isEmpty) {
              editorContainerRef.current.style.height = `${MIN_HEIGHT}px`;
              return;
            }

            const contentHeight = proseMirror.scrollHeight + 10;
            if (contentHeight > MIN_HEIGHT) {
              const newHeight = Math.min(contentHeight, MAX_HEIGHT);
              editorContainerRef.current.style.height = `${newHeight}px`;
            }
          }
        }
      });
    },
    onFocus: ({ editor }) => {
      // Only expand on focus if showExpandButton is true
      if (!showExpandButton) return;

      // When editor is focused (clicked on), expand it if it's currently collapsed
      if (editorContainerRef.current) {
        const currentHeight = editorContainerRef.current.clientHeight;

        // If editor is at min height or close to it, expand it to mid-height
        // But only if it has content
        if (
          currentHeight <= MIN_HEIGHT + 10 &&
          !isManuallyExpanded &&
          !editor.isEmpty
        ) {
          // Cancel manual collapse state if it was set
          if (isManuallyCollapsed) {
            setIsManuallyCollapsed(false);
          }

          // Expand to 50% of max height when clicked (feels natural)
          const focusExpandHeight = Math.max(100, Math.floor(MAX_HEIGHT * 0.5));
          editorContainerRef.current.style.height = `${focusExpandHeight}px`;
          setIsExpanded(true);
        }
      }
    },
  });

  // Use state to track actual expanded status for better UI consistency
  const [isExpanded, setIsExpanded] = useState(false);

  // Update expanded status from actual element height
  useEffect(() => {
    if (!editorContainerRef.current) return;

    const checkExpandedState = () => {
      const currentHeight = editorContainerRef.current?.clientHeight || 0;
      const newExpanded =
        isManuallyExpanded ||
        (currentHeight > MIN_HEIGHT + 10 && !isManuallyCollapsed);

      if (newExpanded !== isExpanded) {
        setIsExpanded(newExpanded);
      }
    };

    // Create a ResizeObserver to monitor height changes
    const resizeObserver = new ResizeObserver(checkExpandedState);
    resizeObserver.observe(editorContainerRef.current);

    // Also check on manual state changes
    checkExpandedState();

    return () => resizeObserver.disconnect();
  }, [isManuallyExpanded, isManuallyCollapsed, isExpanded, MIN_HEIGHT]);

  // Update expanded status immediately when manual states change
  useEffect(() => {
    setIsExpanded(isManuallyExpanded);
  }, [isManuallyExpanded]);

  // Toggle between expanded and collapsed states with better user experience
  const toggleEditorSize = () => {
    // If we're currently in auto mode, determine the toggle direction
    if (!isManuallyExpanded && !isManuallyCollapsed) {
      const currentHeight = editorContainerRef.current?.clientHeight || 0;
      // If closer to MIN_HEIGHT, expand; otherwise collapse
      if (currentHeight < (MIN_HEIGHT + MAX_HEIGHT) / 2) {
        setIsManuallyExpanded(true);
        setIsManuallyCollapsed(false);
      } else {
        setIsManuallyExpanded(false);
        setIsManuallyCollapsed(true);
      }
    }
    // If manually expanded, collapse
    else if (isManuallyExpanded) {
      setIsManuallyExpanded(false);
      setIsManuallyCollapsed(true);
    }
    // If manually collapsed, expand
    else if (isManuallyCollapsed) {
      setIsManuallyExpanded(true);
      setIsManuallyCollapsed(false);
    }
  };

  // Calculate current editor state for icon display
  const isCurrentlyExpanded =
    isManuallyExpanded ||
    (editorContainerRef.current?.clientHeight || 0) > MIN_HEIGHT + 10;

  // Handle direct clicks on editor container
  const handleEditorClick = React.useCallback(() => {
    // Only apply expansion if showExpandButton is true
    if (!showExpandButton) return;

    if (editorContainerRef.current) {
      const currentHeight = editorContainerRef.current.clientHeight;

      // If editor is at min height or close to it, expand it
      // AND make sure there's content before expanding
      if (
        currentHeight <= MIN_HEIGHT + 10 &&
        !isManuallyExpanded &&
        editor &&
        !editor.isEmpty
      ) {
        // Cancel manual collapse state if it was set
        if (isManuallyCollapsed) {
          setIsManuallyCollapsed(false);
        }

        // Expand to half of max height when clicked
        const clickExpandHeight = Math.max(100, Math.floor(MAX_HEIGHT * 0.5));
        editorContainerRef.current.style.height = `${clickExpandHeight}px`;
        setIsExpanded(true);
      }
    }
  }, [
    editorContainerRef,
    MIN_HEIGHT,
    MAX_HEIGHT,
    isManuallyExpanded,
    isManuallyCollapsed,
    editor,
    showExpandButton,
  ]);

  // Set up click event handler when component mounts
  useEffect(() => {
    const editorContainer = editorContainerRef.current;
    if (editorContainer) {
      editorContainer.addEventListener("click", handleEditorClick);
      return () => {
        editorContainer.removeEventListener("click", handleEditorClick);
      };
    }
  }, [handleEditorClick]);

  // Handle focus on the editor container
  const handleEditorFocus = React.useCallback(() => {
    // Same expansion logic as click handler
    handleEditorClick();

    // Also focus the editor explicitly if we have one
    if (editor && !editor.isFocused) {
      editor.commands.focus();
    }
  }, [handleEditorClick, editor]);

  // Force immediate resize if initialized with value
  useLayoutEffect(() => {
    // Only auto-expand if showExpandButton is true
    if (!showExpandButton) return;

    if (value && value.length > 0 && editorContainerRef.current) {
      // Allow time for the editor to render the content
      const timer = setTimeout(() => {
        if (editorContainerRef.current) {
          const proseMirror =
            editorContainerRef.current.querySelector(".ProseMirror");
          if (proseMirror) {
            // Force immediate measurement
            const contentHeight = proseMirror.scrollHeight + 10;
            if (contentHeight > MIN_HEIGHT) {
              // Set height directly
              const newHeight = Math.min(contentHeight, MAX_HEIGHT);
              editorContainerRef.current.style.height = `${newHeight}px`;

              // Update expanded state
              if (newHeight > MIN_HEIGHT + 10) {
                setIsExpanded(true);
              }
            }
          }
        }
      }, 10); // Very short timeout to allow for initial render

      return () => clearTimeout(timer);
    }
  }, [MIN_HEIGHT, MAX_HEIGHT, value, showExpandButton]);

  // Update editor container height based on content and manual overrides
  useEffect(() => {
    if (!editorContainerRef.current || !editor) return;

    // Skip auto-height adjustments if showExpandButton is false
    if (!showExpandButton && !isManuallyExpanded && !isManuallyCollapsed) {
      // Force minimum height for non-expandable editors
      editorContainerRef.current.style.height = `${MIN_HEIGHT}px`;
      return;
    }

    // Track the last measurement to avoid unnecessary updates
    let lastHeight = 0;
    let debounceTimer: ReturnType<typeof setTimeout>;

    if (isManuallyExpanded) {
      // Manual expand takes precedence
      editorContainerRef.current.style.height = `${MAX_HEIGHT}px`;
    } else if (isManuallyCollapsed) {
      // Manual collapse takes precedence
      editorContainerRef.current.style.height = `${MIN_HEIGHT}px`;
    } else {
      // Auto height based on content with ResizeObserver
      const updateHeight = () => {
        if (editorContainerRef.current) {
          const proseMirror =
            editorContainerRef.current.querySelector(".ProseMirror");
          if (proseMirror) {
            // Add a small buffer to the content height for better appearance
            const contentHeight = proseMirror.scrollHeight + 10;

            // Only auto-expand if there's actual content
            if (editor.isEmpty) {
              editorContainerRef.current.style.height = `${MIN_HEIGHT}px`;
              return;
            }

            // Only update if the height has changed significantly
            if (Math.abs(contentHeight - lastHeight) > 5) {
              lastHeight = contentHeight;
              // Always at least MIN_HEIGHT, but no more than MAX_HEIGHT
              const newHeight = Math.max(
                MIN_HEIGHT,
                Math.min(contentHeight, MAX_HEIGHT),
              );
              editorContainerRef.current.style.height = `${newHeight}px`;
            }
          }
        }
      };

      const debouncedUpdate = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateHeight, 50);
      };

      const resizeObserver = new ResizeObserver(debouncedUpdate);

      // Initial size update
      debouncedUpdate();

      // Find the actual content element and observe it
      const proseMirror =
        editorContainerRef.current.querySelector(".ProseMirror");
      if (proseMirror) {
        resizeObserver.observe(proseMirror);
      }

      // Also run the update when editor changes
      editor.on("update", debouncedUpdate);

      return () => {
        clearTimeout(debounceTimer);
        resizeObserver.disconnect();
        editor.off("update", debouncedUpdate);
      };
    }
  }, [
    isManuallyExpanded,
    isManuallyCollapsed,
    editor,
    MIN_HEIGHT,
    MAX_HEIGHT,
    showExpandButton,
  ]);

  // Update the editor when content changes
  useEffect(() => {
    if (editor) {
      const handleUpdate = () => {
        // Only apply auto-expansion behaviors if showExpandButton is true
        if (!showExpandButton) return;

        const currentTime = Date.now();
        setLastTypingTime(currentTime);

        // Auto-reset to minimum height when empty
        if (editor.isEmpty) {
          if (isManuallyCollapsed) {
            setIsManuallyCollapsed(false);
          }

          // Force a minimum height for empty editor
          if (editorContainerRef.current) {
            editorContainerRef.current.style.height = `${MIN_HEIGHT}px`;
          }
        }
        // Auto-reset to auto mode when typing after manual collapse
        else if (isManuallyCollapsed && !editor.isEmpty) {
          // Schedule switching back to auto mode after typing for a short period
          setTimeout(() => {
            // Only proceed if we're still in the latest typing session
            if (lastTypingTime === currentTime) {
              setIsManuallyCollapsed(false);
            }
          }, 700);
        }
      };

      editor.on("update", handleUpdate);
      return () => {
        editor.off("update", handleUpdate);
      };
    }
  }, [
    editor,
    isManuallyCollapsed,
    lastTypingTime,
    MIN_HEIGHT,
    showExpandButton,
  ]);

  // Add effect to handle initial content and ensure expansion
  useEffect(() => {
    if (editor && editorContainerRef.current && !isManuallyCollapsed) {
      // Skip auto-height adjustment if showExpandButton is false
      if (!showExpandButton) return;

      // Function to adjust height based on content
      const adjustHeightForContent = () => {
        if (!editorContainerRef.current) return;

        const proseMirror =
          editorContainerRef.current.querySelector(".ProseMirror");
        if (proseMirror) {
          // Only auto-expand if there's content
          if (editor.isEmpty) {
            editorContainerRef.current.style.height = `${MIN_HEIGHT}px`;
            return;
          }

          const contentHeight = proseMirror.scrollHeight + 10;
          if (contentHeight > MIN_HEIGHT) {
            const newHeight = Math.min(contentHeight, MAX_HEIGHT);
            editorContainerRef.current.style.height = `${newHeight}px`;
          }
        }
      };

      // Handle initial content (with a delay to ensure rendering)
      setTimeout(adjustHeightForContent, 100);

      // Add handlers for content changes including paste
      const onContentChange = () => {
        if (!isManuallyCollapsed && !isManuallyExpanded) {
          setTimeout(adjustHeightForContent, 0);
        }
      };

      editor.on("update", onContentChange);
      editor.on("paste", onContentChange);

      // Also handle value changes from props
      if (value && value.length > 0) {
        onContentChange();
      }

      return () => {
        editor.off("update", onContentChange);
        editor.off("paste", onContentChange);
      };
    }
  }, [
    editor,
    value,
    isManuallyCollapsed,
    isManuallyExpanded,
    MIN_HEIGHT,
    MAX_HEIGHT,
    showExpandButton,
  ]);

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
        <div className="flex items-center justify-between border-b p-4 py-2">
          <EditorMenuBar editor={editor} />
          {showExpandButton && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-stone-100"
                    onClick={toggleEditorSize}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-stone-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-stone-600" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isExpanded ? "Collapse editor" : "Expand editor"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <AiComposer
                      isComposing={defaultToolbarExpanded}
                      onGenerate={onGenerate}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Use AI to compose your email</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="prose w-full flex-1 border p-4">
          <div
            ref={editorContainerRef}
            style={{
              height: `${MIN_HEIGHT}px`, // Initial height
              minHeight: `${MIN_HEIGHT}px`,
              maxHeight: isManuallyExpanded ? `${MAX_HEIGHT}px` : "auto",
              transition: "height 0.15s ease-in-out",
              overflow: "auto",
            }}
            className="cursor-text border p-2"
            onClick={handleEditorClick} // Direct click handler
            onFocus={handleEditorFocus} // Direct focus handler
            tabIndex={0} // Make div focusable
          >
            <EditorContent editor={editor} value={value} />
          </div>
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
