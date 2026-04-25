import { Search } from "lucide-react";

interface NavSearchProps {
  label: string;
}

export function NavSearch({ label }: NavSearchProps) {
  return (
    <button
      className="p-2 rounded-full hover:bg-white/10 transition-colors"
      aria-label={label}
    >
      <Search className="w-5 h-5 text-[#d2d2d7]" />
    </button>
  );
}
