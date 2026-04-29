import Link from "next/link";
import { Search } from "lucide-react";

interface NavSearchProps {
  label: string;
  href: string;
}

export function NavSearch({ label, href }: NavSearchProps) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300"
      aria-label={label}
      style={{
        background: "rgba(17,17,9,0.84)",
        border: "1px solid rgba(201,168,76,0.14)",
        color: "var(--color-text)",
        backdropFilter: "blur(14px)",
      }}
    >
      <Search className="h-4 w-4" strokeWidth={1.8} />
    </Link>
  );
}
