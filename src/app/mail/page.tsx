"use client";
import dynamic from "next/dynamic";

const Mail = dynamic(() => import("./Mail"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Page = () => {
  return (
    <>
      <Mail
        defaultLayout={[10, 20, 30]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </>
  );
};

export default Page;
