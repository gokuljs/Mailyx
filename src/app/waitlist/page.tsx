"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import NavBar from "../_components/navbar";
import Footer from "../_components/footer";
import ParticlesBackground from "../_components/Particles";
import { GlowingEffect } from "../_components/glowing-effect";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function WaitlistPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Redirect authenticated users to /mail
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/mail");
    }
  }, [isLoaded, isSignedIn, router]);

  const addToWaitlistMutation = api.waitlist.addToWaitlist.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success(
        "You're on the waitlist! We'll notify you when Mailyx is ready.",
      );
      setEmail("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    addToWaitlistMutation.mutate({ email });
  };

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300/30 border-t-neutral-300"></div>
      </div>
    );
  }

  // Don't render waitlist content if user is signed in (they will be redirected)
  if (isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300/30 border-t-neutral-300"></div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center bg-black pt-60 md:px-0">
      <ParticlesBackground />

      {!isSubmitted ? (
        <div className="flex flex-col items-center justify-center px-2">
          <h1 className="inline-block bg-linear-to-br from-white to-stone-500 bg-clip-text px-2 text-center text-4xl font-bold text-transparent md:px-0 md:text-6xl">
            Join the Mailyx
          </h1>
          <div className="h-4"></div>
          <p className="max-w-xxl mb-8 px-3 text-center text-lg text-stone-600 md:px-0 md:text-xl">
            Be among the first to experience the future of email management.
          </p>
          <div className="h-8"></div>
          <div className="rounded-2.5xl relative w-full max-w-2xl border border-neutral-500 p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
              borderWidth={2}
              spread={100}
              glow={true}
              disabled={false}
              proximity={180}
              inactiveZone={0.1}
              variant="white"
            />
            <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-black p-6 shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <h3 className="-tracking-4 pt-0.5 font-sans text-xl font-semibold text-balance text-white md:text-2xl/[1.875rem]">
                    Get Early Access
                  </h3>
                  <p className="font-sans text-sm/[1.125rem] text-gray-500 md:text-base/[1.375rem]">
                    Enter your email to be notified when Mailyx launches.
                  </p>
                </div>

                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-stone-400/30 bg-stone-800/50 pr-12 text-white placeholder:text-stone-500 focus:border-stone-400 focus:ring-stone-400"
                    required
                  />
                  <Mail className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 transform text-stone-500" />
                </div>

                <Button
                  type="submit"
                  disabled={addToWaitlistMutation.isPending}
                  className="w-full cursor-pointer rounded-3xl border border-stone-400/30 bg-stone-700 font-semibold text-neutral-300 transition-all duration-150 hover:bg-black/80 disabled:opacity-50"
                >
                  {addToWaitlistMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300/30 border-t-neutral-300"></div>
                      Joining Waitlist...
                    </div>
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                      href="/sign-in"
                      className="text-neutral-300 underline underline-offset-2 transition-colors duration-200 hover:text-white"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-500" />
            <h1 className="inline-block bg-linear-to-br from-white to-stone-500 bg-clip-text px-2 text-center text-4xl font-bold text-transparent md:px-0 md:text-6xl">
              You&apos;re In!
            </h1>
            <div className="h-4"></div>
            <p className="mb-8 max-w-xl px-3 text-center text-lg text-stone-600 md:px-0 md:text-xl">
              We&apos;ll notify you as soon as Mailyx is ready for you to
              experience.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
