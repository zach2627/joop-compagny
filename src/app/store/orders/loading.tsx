export default function OrdersLoading() {
  return (
    <div
      className="px-4 py-12"
      style={{ background: "#0A0A08", minHeight: "100vh" }}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded" style={{ background: "#1A1A14" }} />
            <div className="h-7 w-40 animate-pulse rounded" style={{ background: "#1A1A14" }} />
            <div className="h-3 w-24 animate-pulse rounded" style={{ background: "#1A1A14" }} />
          </div>
          <div className="h-9 w-28 animate-pulse rounded-full" style={{ background: "#1A1A14" }} />
        </div>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-apple-xl"
            style={{
              background: "#111109",
              border: "1px solid rgba(201,168,76,0.1)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="space-y-1.5">
                <div className="h-4 w-32 animate-pulse rounded" style={{ background: "#1A1A14" }} />
                <div className="h-3 w-48 animate-pulse rounded" style={{ background: "#1A1A14" }} />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-20 animate-pulse rounded-full" style={{ background: "#1A1A14" }} />
                <div className="h-4 w-24 animate-pulse rounded" style={{ background: "#1A1A14" }} />
              </div>
            </div>
            <div className="space-y-3 px-6 py-4">
              {[...Array(2)].map((__, lineIndex) => (
                <div key={lineIndex} className="flex items-center gap-4">
                  <div className="h-14 w-14 animate-pulse rounded-apple-md" style={{ background: "#1A1A14" }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-3/4 animate-pulse rounded" style={{ background: "#1A1A14" }} />
                    <div className="h-3 w-1/2 animate-pulse rounded" style={{ background: "#1A1A14" }} />
                  </div>
                  <div className="h-4 w-20 animate-pulse rounded" style={{ background: "#1A1A14" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
