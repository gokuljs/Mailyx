"use client";
import { ModeToggle } from "@/components/ui/ToggleButton";
import { UserButton } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import ComposeButton from "./ComposeButton";

const Mail = dynamic(() => import("./Mail"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Page = () => {
  return (
    <>
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="dark:border-muted flex h-fit w-fit items-center justify-center rounded-full border border-slate-600 bg-transparent p-1">
          <UserButton />
        </div>
        <ModeToggle />
        <ComposeButton />
      </div>
      <Mail
        defaultLayout={[20, 40, 40]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </>
  );
};

export default Page;
