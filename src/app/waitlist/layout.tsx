import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Waitlist | Mailyx",
  description:
    "Be among the first to experience the future of email management with Mailyx. Join our waitlist today.",
  openGraph: {
    title: "Join the Waitlist | Mailyx",
    description:
      "Be among the first to experience the future of email management with Mailyx. Join our waitlist today.",
    type: "website",
  },
  twitter: {
    title: "Join the Waitlist | Mailyx",
    description:
      "Be among the first to experience the future of email management with Mailyx. Join our waitlist today.",
  },
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
