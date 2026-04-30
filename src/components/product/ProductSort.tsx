"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ProductSortProps {
  labels: {
    featured: string;
    newest: string;
    priceAsc: string;
    priceDesc: string;
    popular: string;
  };
}

export function ProductSort({ labels }: ProductSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "featured";
  const sortOptions = [
    { value: "featured", label: labels.featured },
    { value: "newest", label: labels.newest },
    { value: "price_asc", label: labels.priceAsc },
    { value: "price_desc", label: labels.priceDesc },
    { value: "popular", label: labels.popular },
  ];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="rounded-full px-4 py-2 text-sm focus:outline-none"
      style={{
        colorScheme: "dark",
        background: "rgba(17,17,9,0.9)",
        border: "1px solid rgba(201,168,76,0.14)",
        color: "var(--color-text)",
        boxShadow: "0 10px 26px rgba(0,0,0,0.28)",
      }}
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
