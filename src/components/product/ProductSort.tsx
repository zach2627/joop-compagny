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
      className="text-sm border border-apple-gray-200 rounded-full px-3 py-1.5 bg-white text-apple-gray-700 focus:outline-none focus:ring-2 focus:ring-apple-blue"
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
