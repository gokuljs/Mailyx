"use client";

import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";

export const SignOutButton = () => {
  const { signOut } = useClerk();

  return (
    // Clicking this button signs out a user
    // and redirects them to the home page "/".
    <Button onClick={() => signOut({ redirectUrl: "/" })}>Sign out</Button>
  );
};
