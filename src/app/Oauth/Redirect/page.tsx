"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function OAuthRedirect() {
  const params = useSearchParams();

  useEffect(() => {
    const state = params.get("state");
    const code = params.get("code");
    const scope = params.get("scope");

    if (state && code) {
      const aurinkoCallback = `https://api.aurinko.io/v1/auth/callback?state=${encodeURIComponent(state)}&code=${encodeURIComponent(code)}&scope=${encodeURIComponent(scope ?? "")}`;
      window.location.href = aurinkoCallback;
    }
  }, [params]);

  return <div className="text-white">Redirecting securely...</div>;
}
