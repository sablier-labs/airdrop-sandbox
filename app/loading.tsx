import { LoadingSpinnerWithText } from "./components/ui/LoadingSpinner";

/**
 * Loading skeleton for the main page
 *
 * Displayed while the page is loading (during server-side rendering or suspense boundaries)
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinnerWithText size="lg" text="Loading campaign..." />
    </div>
  );
}
