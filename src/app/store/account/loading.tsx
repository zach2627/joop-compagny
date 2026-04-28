export default function AccountLoading() {
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
            <div className="h-3 w-48 animate-pulse rounded" style={{ background: "#1A1A14" }} />
          </div>
          <div className="h-9 w-32 animate-pulse rounded-full" style={{ background: "#1A1A14" }} />
        </div>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="rounded-apple-xl space-y-4 p-6"
            style={{
              background: "#111109",
              border: "1px solid rgba(201,168,76,0.1)",
            }}
          >
            <div className="h-4 w-48 animate-pulse rounded" style={{ background: "#1A1A14" }} />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((__, lineIndex) => (
                <div key={lineIndex} className="space-y-1">
                  <div className="h-3 w-16 animate-pulse rounded" style={{ background: "#1A1A14" }} />
                  <div className="h-4 w-32 animate-pulse rounded" style={{ background: "#1A1A14" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
