// src/app/store/layout.tsx
import { StoreNavbar } from "@/components/layout/StoreNavbar";
import { StoreBanner } from "@/components/layout/StoreBanner";
import { StoreFooter } from "@/components/layout/StoreFooter";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StoreBanner />
      <StoreNavbar />
      <main className="pt-[96px]">
        {children}
      </main>
      <StoreFooter />
    </>
  );
}
