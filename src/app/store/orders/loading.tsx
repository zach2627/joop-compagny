// src/app/store/orders/loading.tsx
export default function OrdersLoading() {
  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }} className="py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-28 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
            <div className="h-7 w-40 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
            <div className="h-3 w-24 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
          </div>
          <div className="h-9 w-28 rounded-full animate-pulse" style={{ background: "#2A2A2A" }} />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-apple-xl overflow-hidden"
            style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.1)" }}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
                <div className="h-3 w-48 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-20 rounded-full animate-pulse" style={{ background: "#2A2A2A" }} />
                <div className="h-4 w-24 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
              </div>
            </div>
            <div className="px-6 py-4 space-y-3">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-apple-md animate-pulse" style={{ background: "#2A2A2A" }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
                    <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
                  </div>
                  <div className="h-4 w-20 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
