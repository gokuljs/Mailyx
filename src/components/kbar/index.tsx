"use client";
import {
  type Action,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
} from "kbar";
import RenderResults from "./RenderResults";
import { useLocalStorage } from "usehooks-ts";
export default function Kbar({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useLocalStorage("mailyx-tab", "");
  const [done, setDone] = useLocalStorage("mailyx-done", false);
  const actions: Action[] = [
    {
      id: "inboxAction",
      name: "Inbox",
      shortcut: ["g", "i"],
      keywords: "inbox",
      section: "Navigation",
      subtitle: "Go to your Inbox to read new and old messages",
      perform: () => {
        setTab("inbox");
      },
    },
    {
      id: "draftAction",
      name: "Draft",
      shortcut: ["g", "d"],
      keywords: "draft",
      section: "Navigation",
      subtitle: "Access your saved drafts and continue writing",
      perform: () => {
        setTab("draft");
      },
    },
    {
      id: "sentAction",
      name: "Sent",
      shortcut: ["g", "s"],
      keywords: "sent",
      section: "Navigation",
      subtitle: "View messages you've already sent",
      perform: () => {
        setTab("sent");
      },
    },
    {
      id: "pendingAction",
      name: "See done",
      shortcut: ["g", "c"],
      keywords: "done",
      section: "Navigation",
      subtitle: "View the done emails",
      perform: () => {
        setDone(true);
      },
    },
    {
      id: "doneAction",
      name: "See pending",
      shortcut: ["g", "p"],
      keywords: "Pending,undone, not done",
      section: "Navigation",
      subtitle: "View the pending emails",
      perform: () => {
        setDone(false);
      },
    },
  ];

  return (
    <KBarProvider actions={actions}>
      <ActualComponent>{children}</ActualComponent>
    </KBarProvider>
  );
}

const ActualComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <KBarPortal>
        <KBarPositioner className="scrollbar-hide fixed inset-0 z-[99999] bg-black/40 !p-0 backdrop-blur-sm dark:bg-black/60">
          <KBarAnimator className="text-foreground relative !mt-64 w-full max-w-[600px] !-translate-y-12 overflow-hidden rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <div className="border-x-0 border-b-2 dark:border-gray-700">
              <KBarSearch className="w-full border-none bg-white px-6 py-4 text-lg outline-none focus:ring-0 focus:ring-offset-0 focus:outline-none dark:bg-gray-800" />
            </div>
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
