import Mail from "./Mail";

const Page = () => {
  return (
    <Mail
      defaultLayout={[10, 20, 30]}
      defaultCollapsed={false}
      navCollapsedSize={4}
    />
  );
};

export default Page;
