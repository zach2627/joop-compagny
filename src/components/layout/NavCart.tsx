import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface NavCartProps {
  itemCount: number;
  href: string;
  label: string;
}

export function NavCart({ itemCount, href, label }: NavCartProps) {
  return (
    <Link
      href={href}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300"
      aria-label={label}
      style={{
        background: "rgba(17,17,9,0.84)",
        border: "1px solid rgba(201,168,76,0.14)",
        color: "var(--color-text)",
        backdropFilter: "blur(14px)",
      }}
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.9} />
      {itemCount > 0 && (
        <span
          className="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
          style={{
            background: "linear-gradient(135deg, #e8c97a 0%, #c9a84c 100%)",
            color: "#0a0a08",
            boxShadow: "0 8px 18px rgba(201,168,76,0.24)",
          }}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
