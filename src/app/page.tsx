import { Button } from "@/components/ui/button";
import { SignOutButton } from "./_components/SignOutButton";
import Image from "next/image";
import Link from "next/link";
import { BackgroundBeams } from "./_components/background-beams";
import { HoverBorderGradient } from "./_components/hover-border-gradient";

export default async function Home() {
  // const { signOut } = useClerk();

  return (
    <>
      <>
        <div className="relative z-[10] flex min-h-screen flex-col items-center bg-black pt-60">
          <BackgroundBeams />
          <h1 className="inline-block bg-gradient-to-r from-gray-600 to-gray-900 bg-clip-text text-center text-6xl font-bold text-transparent">
            Mailyx — A minimalist, <br />
            AI-powered email client.
          </h1>
          <div className="h-4"></div>
          <p className="mb-8 max-w-xl text-center text-xl text-gray-600">
            A calm, modern email client designed for clarity, not clutter.
          </p>
          <div className="space-x-4">
            <HoverBorderGradient as="button" duration={1} clockwise={true}>
              <Link href="/mail"> Start Using Mailyx</Link>
            </HoverBorderGradient>
          </div>
          <div className="mx-auto mt-12 max-w-5xl">
            <h2 className="mb-4 text-center text-2xl font-semibold text-white">
              Experience the power of:
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-black p-6 shadow-md">
                <h3 className="mb-2 text-xl font-semibold text-white">
                  AI-driven email RAG
                </h3>
                <p className="text-gray-600">
                  Automatically prioritize your emails with our advanced AI
                  system.
                </p>
              </div>
              <div className="rounded-lg border bg-black p-6 shadow-md">
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Full-text search
                </h3>
                <p className="text-gray-600">
                  Quickly find any email with our powerful search functionality.
                </p>
              </div>
              <div className="rounded-lg border bg-black p-6 shadow-md">
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Shortcut-focused interface
                </h3>
                <p className="text-gray-600">
                  Navigate your inbox efficiently with our intuitive keyboard
                  shortcuts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );
}
