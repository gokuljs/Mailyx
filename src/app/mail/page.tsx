"use client";
import { ModeToggle } from "@/components/ui/ToggleButton";
import { UserButton } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import ComposeButton from "./ComposeButton";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
const Mail = dynamic(() => import("./Mail"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Page = () => {
  const router = useRouter();
  return (
    <>
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="dark:border-muted flex h-fit w-fit items-center justify-center rounded-full border border-slate-600 bg-transparent p-1">
          <UserButton />
        </div>
        <ModeToggle />
        <Button
          className="cursor-pointer"
          onClick={() => router.push("/settings")}
          variant="outline"
          size="icon"
        >
          <Settings />
        </Button>
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
