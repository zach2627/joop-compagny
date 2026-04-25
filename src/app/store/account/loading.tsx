// src/app/store/account/loading.tsx
export default function AccountLoading() {
  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }} className="py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-28 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
            <div className="h-7 w-40 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
            <div className="h-3 w-48 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
          </div>
          <div className="h-9 w-32 rounded-full animate-pulse" style={{ background: "#2A2A2A" }} />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-apple-xl p-6 space-y-4"
            style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.1)" }}>
            <div className="h-4 w-48 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="h-3 w-16 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
                  <div className="h-4 w-32 rounded animate-pulse" style={{ background: "#2A2A2A" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
