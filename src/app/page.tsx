import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";

export default async function Home() {
  return (
    <div className="flex items-center justify-between border text-red-400">
      <div>Hello world</div>
      <Button>
        <SignOutButton></SignOutButton>
      </Button>
    </div>
  );
}
