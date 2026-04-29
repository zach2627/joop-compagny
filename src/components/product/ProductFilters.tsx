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
    <div
      className="space-y-7 rounded-[30px] p-5 md:p-6"
      style={{
        background: "rgba(17,17,9,0.84)",
        border: "1px solid rgba(201,168,76,0.14)",
        boxShadow: "0 24px 56px rgba(0,0,0,0.34)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div>
        <h3 className="luxe-kicker mb-3">{labels.category}</h3>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => updateFilters({ category: undefined })}
              className="w-full rounded-2xl px-3 py-2 text-left text-sm transition-colors"
              style={
                !currentFilters.category
                  ? {
                      background: "rgba(184,138,84,0.12)",
                      border: "1px solid rgba(201,168,76,0.14)",
                      color: "var(--color-text)",
                    }
                  : { color: "var(--color-text-secondary)" }
              }
            >
              {labels.all}
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => updateFilters({ category: cat.slug })}
                className="flex w-full justify-between rounded-2xl px-3 py-2 text-left text-sm transition-colors"
                style={
                  currentFilters.category === cat.slug
                    ? {
                        background: "rgba(184,138,84,0.12)",
                        border: "1px solid rgba(201,168,76,0.14)",
                        color: "var(--color-text)",
                      }
                    : { color: "var(--color-text-secondary)" }
                }
              >
                <span>{cat.name}</span>
                <span style={{ color: "var(--color-text-tertiary)" }}>{cat.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="luxe-kicker mb-3">{labels.price}</h3>
        <ul className="space-y-1.5">
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
                  className="w-full rounded-2xl px-3 py-2 text-left text-sm transition-colors"
                  style={
                    isActive
                      ? {
                          background: "rgba(184,138,84,0.12)",
                          color: "var(--color-text)",
                        }
                      : { color: "var(--color-text-secondary)" }
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
          <h3 className="luxe-kicker mb-3">{labels.storage}</h3>
          <div className="flex flex-wrap gap-2">
            {formatOptions.map((storage) => (
              <button
                key={storage}
                onClick={() =>
                  updateFilters({
                    storage: currentFilters.storage === storage ? undefined : storage,
                  })
                }
                className="rounded-full border px-3 py-1.5 text-xs transition-colors"
                style={
                  currentFilters.storage === storage
                    ? {
                        borderColor: "rgba(184,138,84,0.3)",
                        background: "rgba(184,138,84,0.12)",
                        color: "var(--color-text)",
                      }
                    : {
                        borderColor: "rgba(184,138,84,0.12)",
                        color: "var(--color-text-secondary)",
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
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={currentFilters.inStock ?? false}
            onChange={(event) =>
              updateFilters({ inStock: event.target.checked ? "true" : undefined })
            }
            className="h-4 w-4 rounded accent-[#c9a84c]"
          />
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {labels.inStockOnly}
          </span>
        </label>
      </div>

      {(currentFilters.category ||
        currentFilters.minPrice ||
        currentFilters.maxPrice ||
        currentFilters.storage ||
        currentFilters.inStock) && (
        <button
          onClick={() => router.push(resetHref)}
          className="text-sm"
          style={{ color: "var(--color-primary-dark)" }}
        >
          {labels.resetFilters}
        </button>
      )}
    </div>
  );
}
