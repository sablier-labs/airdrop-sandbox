import { Footer } from "./footer";
import { Header } from "./header";

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-screen-2xl py-8">{children}</main>
      <Footer />
    </div>
  );
}
