"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ProductFilter } from "@/lib/validation/schemas";

interface FiltersProps {
  categories: { name: string; slug: string; count: number }[];
  currentFilters: ProductFilter;
  resetHref: string;
  formatOptions: string[];
  labels: {
    category: string;
    price: string;
    storage: string;
    all: string;
    inStockOnly: string;
    resetFilters: string;
    priceRanges: string[];
  };
}

export function ProductFilters({
  categories,
  currentFilters,
  resetHref,
  formatOptions,
  labels,
}: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilters(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  const priceRanges = [
    { label: labels.priceRanges[0], min: undefined, max: undefined },
    { label: labels.priceRanges[1], min: undefined, max: 25000 },
    { label: labels.priceRanges[2], min: 25000, max: 50000 },
    { label: labels.priceRanges[3], min: 50000, max: 100000 },
    { label: labels.priceRanges[4], min: 100000, max: undefined },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#f6c668" }}>
          {labels.category}
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateFilters({ category: undefined })}
              className="w-full text-left text-sm px-3 py-2 rounded-2xl transition-colors"
              style={
                !currentFilters.category
                  ? { background: "rgba(246,198,104,0.14)", color: "#fff6fb" }
                  : { color: "#d6bfd0" }
              }
            >
              {labels.all}
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => updateFilters({ category: cat.slug })}
                className="w-full text-left text-sm px-3 py-2 rounded-2xl transition-colors flex justify-between"
                style={
                  currentFilters.category === cat.slug
                    ? { background: "rgba(246,198,104,0.14)", color: "#fff6fb" }
                    : { color: "#d6bfd0" }
                }
              >
                <span>{cat.name}</span>
                <span className="opacity-60 text-xs">{cat.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#f6c668" }}>
          {labels.price}
        </h3>
        <ul className="space-y-1">
          {priceRanges.map(({ label, min, max }) => {
            const isActive =
              currentFilters.minPrice === min && currentFilters.maxPrice === max;
            return (
              <li key={label}>
                <button
                  onClick={() =>
                    updateFilters({
                      minPrice: min?.toString(),
                      maxPrice: max?.toString(),
                    })
                  }
                  className="w-full text-left text-sm px-3 py-2 rounded-2xl transition-colors"
                  style={
                    isActive
                      ? { background: "rgba(246,198,104,0.14)", color: "#fff6fb" }
                      : { color: "#d6bfd0" }
                  }
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {formatOptions.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#f6c668" }}>
            {labels.storage}
          </h3>
          <div className="flex flex-wrap gap-2">
            {formatOptions.map((storage) => (
              <button
                key={storage}
                onClick={() =>
                  updateFilters({
                    storage: currentFilters.storage === storage ? undefined : storage,
                  })
                }
                className="px-3 py-1.5 text-xs rounded-full border transition-colors"
                style={
                  currentFilters.storage === storage
                    ? {
                        borderColor: "#f6c668",
                        background: "rgba(246,198,104,0.14)",
                        color: "#fff6fb",
                      }
                    : {
                        borderColor: "rgba(246,198,104,0.16)",
                        color: "#d6bfd0",
                      }
                }
              >
                {storage}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={currentFilters.inStock ?? false}
            onChange={(event) =>
              updateFilters({ inStock: event.target.checked ? "true" : undefined })
            }
            className="w-4 h-4 rounded accent-[#f6c668]"
          />
          <span className="text-sm" style={{ color: "#d6bfd0" }}>
            {labels.inStockOnly}
          </span>
        </label>
      </div>

      {(currentFilters.category ||
        currentFilters.minPrice ||
        currentFilters.maxPrice ||
        currentFilters.storage ||
        currentFilters.inStock) && (
        <button onClick={() => router.push(resetHref)} className="text-sm" style={{ color: "#f6c668" }}>
          {labels.resetFilters}
        </button>
      )}
    </div>
  );
}
