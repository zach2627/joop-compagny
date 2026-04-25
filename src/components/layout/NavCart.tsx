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
      className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      aria-label={label}
    >
      <ShoppingBag className="w-5 h-5 text-[#d2d2d7]" />
      {itemCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                     bg-apple-blue text-white text-[10px] font-bold rounded-full
                     flex items-center justify-center"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
