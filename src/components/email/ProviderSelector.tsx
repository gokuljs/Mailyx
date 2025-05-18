"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X } from "lucide-react";
import Image from "next/image";
import React from "react";

export type EmailProvider = "Google" | "Office365";

interface ProviderSelectorProps {
  onSelect: (provider: EmailProvider) => void;
  onCancel: () => void;
  isLoading: boolean;
  loadingProvider: EmailProvider | null;
}

export function ProviderSelector({
  onSelect,
  onCancel,
  isLoading,
  loadingProvider,
}: ProviderSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-sm">
      <Card className="w-[40%] overflow-hidden border-stone-200/10 bg-white shadow-xl dark:bg-[hsl(20_14.3%_4.1%)] dark:text-white">
        <CardHeader className="border-b border-stone-100 bg-stone-50 px-4 py-2 dark:border-stone-800 dark:bg-[hsl(20_14.3%_4.1%)]">
          <div className="flex min-h-[10px] items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">
                Email Provider
              </CardTitle>
              <CardDescription className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                Select your email service to continue
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-[hsl(20_14.3%_10%)] dark:hover:text-stone-200"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => onSelect("Google")}
              variant="outline"
              className="group flex h-16 w-full items-center justify-between gap-4 border-stone-200 p-3 transition-all hover:border-stone-300 hover:bg-stone-50 hover:shadow-sm dark:border-stone-700 dark:hover:border-stone-600 dark:hover:bg-[hsl(20_14.3%_8%)]"
              disabled={isLoading}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm transition-transform group-hover:scale-110 dark:bg-[hsl(20_14.3%_10%)]">
                  <Image
                    src="/google.svg"
                    alt="Google"
                    className="h-6 w-6 object-contain"
                    width={24}
                    height={24}
                  />
                </div>
                <div className="text-left">
                  <div className="text-base font-medium">Google</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    Gmail and Google Workspace
                  </div>
                </div>
              </div>

              {isLoading && loadingProvider === "Google" ? (
                <div className="flex h-5 w-5 animate-spin items-center justify-center rounded-full border-2 border-stone-300 border-t-stone-600 dark:border-stone-600 dark:border-t-stone-300"></div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 p-1.5 transition-colors group-hover:bg-stone-200 dark:bg-[hsl(20_14.3%_10%)] dark:group-hover:bg-[hsl(20_14.3%_15%)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-full w-full text-stone-600 dark:text-stone-400"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              )}
            </Button>

            <Button
              onClick={() => onSelect("Office365")}
              variant="outline"
              className="group flex h-16 w-full items-center justify-between gap-4 border-stone-200 p-3 transition-all hover:border-stone-300 hover:bg-stone-50 hover:shadow-sm dark:border-stone-700 dark:hover:border-stone-600 dark:hover:bg-[hsl(20_14.3%_8%)]"
              disabled={isLoading}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm transition-transform group-hover:scale-110 dark:bg-[hsl(20_14.3%_10%)]">
                  <Image
                    src="/outlook.svg"
                    alt="Microsoft"
                    className="h-6 w-6 object-contain"
                    width={24}
                    height={24}
                  />
                </div>
                <div className="text-left">
                  <div className="text-base font-medium">Microsoft</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    Outlook and Office 365
                  </div>
                </div>
              </div>

              {isLoading && loadingProvider === "Office365" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600 dark:border-stone-600 dark:border-t-stone-300"></div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 p-1.5 transition-colors group-hover:bg-stone-200 dark:bg-[hsl(20_14.3%_10%)] dark:group-hover:bg-[hsl(20_14.3%_15%)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-full w-full text-stone-600 dark:text-stone-400"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
