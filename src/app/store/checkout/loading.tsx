// src/app/store/checkout/loading.tsx
export default function CheckoutLoading() {
  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }} className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-2 mb-10">
          <div className="h-3 w-20 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
          <div className="h-8 w-64 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
        </div>
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            <div className="rounded-apple-xl p-6 space-y-4"
              style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.1)" }}>
              <div className="h-5 w-40 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-20 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
                    <div className="h-10 rounded-apple-md animate-pulse" style={{ background: "#2A2A2A" }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-apple-xl p-6 space-y-4"
              style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.1)" }}>
              <div className="h-5 w-40 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-apple-md animate-pulse" style={{ background: "#2A2A2A" }} />
              ))}
            </div>
          </div>
          <div className="rounded-apple-xl p-6 space-y-4 h-fit"
            style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.1)" }}>
            <div className="h-5 w-32 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-full rounded animate-pulse" style={{ background: "#2A2A2A" }} />
                  <div className="h-3 w-2/3 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
                </div>
              </div>
            ))}
            <div className="h-12 rounded-full animate-pulse mt-4" style={{ background: "#2A2A2A" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
