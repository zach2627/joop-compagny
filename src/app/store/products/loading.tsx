// src/app/store/products/loading.tsx
export default function ProductsLoading() {
  return (
    <div className="container-xl py-12">
      {/* Filters skeleton */}
      <div className="flex gap-3 mb-8 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-apple-gray-100 rounded-full animate-pulse" />
        ))}
      </div>

      {/* Products grid skeleton */}
      <div className="product-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-square bg-apple-gray-100 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-3 w-16 bg-apple-gray-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-apple-gray-100 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-apple-gray-100 rounded animate-pulse" />
              <div className="h-5 w-24 bg-apple-gray-100 rounded animate-pulse mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
