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
import useAccountSwitching from "./useAccountSwitching";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import useThemeSwitching from "./useThemeSwithcing";

export default function Kbar({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
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
      name: "Drafts",
      shortcut: ["g", "d"],
      keywords: "drafts",
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
      name: "See Done",
      shortcut: ["g", "c"],
      keywords: "done, completed",
      section: "Navigation",
      subtitle: "View completed emails",
      perform: () => {
        setDone(true);
      },
    },
    {
      id: "doneAction",
      name: "See Pending",
      shortcut: ["g", "p"],
      keywords: "pending, undone, not done",
      section: "Navigation",
      subtitle: "View pending emails",
      perform: () => {
        setDone(false);
      },
    },
  ];

  if (!isSignedIn || pathname !== "/mail") {
    return <>{children}</>;
  }

  return (
    <KBarProvider actions={actions}>
      <ActualComponent>{children}</ActualComponent>
    </KBarProvider>
  );
}

const ActualComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();
  useAccountSwitching();
  return (
    <>
      <KBarPortal>
        <KBarPositioner className="scrollbar-hide fixed inset-0 z-[99999] bg-black/40 !p-0 backdrop-blur-sm dark:bg-black/60">
          <KBarAnimator className="text-foreground relative !mt-[300px] w-full !-translate-y-12 overflow-hidden rounded-[0.5rem] border bg-white shadow-lg sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] dark:border-gray-950 dark:bg-[hsl(20_14.3%_4.1%)] dark:text-gray-200">
            <div className="dark:border-muted border-x-0 border-b-2">
              <KBarSearch className="w-full border-none bg-white px-6 py-4 text-lg outline-none focus:ring-0 focus:ring-offset-0 focus:outline-none dark:bg-[hsl(20_14.3%_4.1%)]" />
            </div>
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
