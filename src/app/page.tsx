import { Button } from "@/components/ui/button";
import { SignOutButton, useClerk } from "@clerk/nextjs";

export default async function Home() {
  // const { signOut } = useClerk();

  return (
    <div className="flex items-center justify-between border text-red-400">
      <div>Hello world</div>
      <SignOutButton />
    </div>
  );
}
