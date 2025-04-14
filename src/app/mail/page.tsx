"use client";
import { ModeToggle } from "@/components/ui/ToggleButton";
import dynamic from "next/dynamic";

const Mail = dynamic(() => import("./Mail"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Page = () => {
  return (
    <>
      <div className="absolute bottom-4 left-4">
        <ModeToggle />
      </div>
      <Mail
        defaultLayout={[10, 20, 30]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </>
  );
};

export default Page;
