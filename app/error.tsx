"use client";

import { useEffect } from "react";
import { Container } from "./components/layout/Container";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/Card";

/**
 * Error boundary for the main page
 *
 * Catches errors during rendering and provides a user-friendly error message
 * with a retry option.
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js requires this exact function name for error boundaries
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    // CUSTOMIZE: Add your error tracking service (Sentry, LogRocket, etc.)
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <Container size="md">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-red-100 dark:bg-red-900 p-3">
                    <svg
                      className="h-8 w-8 text-red-600 dark:text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <CardTitle>Something went wrong</CardTitle>
                    <CardDescription>
                      An error occurred while loading the airdrop campaign
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Error Details */}
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-900 dark:text-red-100 font-medium mb-2">
                      Error Details:
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 font-mono break-all">
                      {error.message || "Unknown error occurred"}
                    </p>
                  </div>

                  {/* Troubleshooting Tips */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Try the following:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>Refresh the page</li>
                      <li>Check your internet connection</li>
                      <li>Make sure you&apos;re connected to the correct network</li>
                      <li>Clear your browser cache and try again</li>
                    </ul>
                  </div>

                  {/* Retry Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={reset}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>

                  {/* Contact Support */}
                  <div className="pt-2 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      If the problem persists, please{" "}
                      <a
                        href="https://discord.gg/sablier"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        contact support
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
