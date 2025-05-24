import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";
import Kbar from "@/components/kbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"),
  title: "Mailyx | AI-Powered Email Client",
  description:
    "Experience Mailyx, a calm, modern, AI-powered email client designed for clarity and focus, not clutter.",
  keywords: [
    "email client",
    "AI email",
    "minimalist email",
    "modern email",
    "productivity",
    "inbox zero",
  ],
  icons: [{ rel: "icon", url: "/brand-logo.svg" }],
  openGraph: {
    title: "Mailyx | AI-Powered Email Client",
    description:
      "Experience Mailyx, a calm, modern, AI-powered email client designed for clarity and focus, not clutter.",
    type: "website",
  },
  twitter: {
    title: "Mailyx | AI-Powered Email Client",
    description:
      "Experience Mailyx, a calm, modern, AI-powered email client designed for clarity and focus, not clutter.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      waitlistUrl="/waitlist"
      afterSignInUrl="/mail"
      afterSignUpUrl="/mail"
    >
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              <Kbar> {children}</Kbar>
              <Toaster />
            </TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
