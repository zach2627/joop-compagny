export default function CheckoutLoading() {
  return (
    <div
      className="px-4 py-12"
      style={{ background: "#0A0A08", minHeight: "100vh" }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded" style={{ background: "#1A1A14" }} />
          <div className="h-8 w-64 animate-pulse rounded" style={{ background: "#1A1A14" }} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div
              className="rounded-apple-xl space-y-4 p-6"
              style={{
                background: "#111109",
                border: "1px solid rgba(201,168,76,0.1)",
              }}
            >
              <div className="h-5 w-40 animate-pulse rounded" style={{ background: "#1A1A14" }} />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="h-3 w-20 animate-pulse rounded" style={{ background: "#1A1A14" }} />
                    <div className="h-10 animate-pulse rounded-apple-md" style={{ background: "#1A1A14" }} />
                  </div>
                ))}
              </div>
            </div>
            <div
              className="rounded-apple-xl space-y-4 p-6"
              style={{
                background: "#111109",
                border: "1px solid rgba(201,168,76,0.1)",
              }}
            >
              <div className="h-5 w-40 animate-pulse rounded" style={{ background: "#1A1A14" }} />
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-apple-md"
                  style={{ background: "#1A1A14" }}
                />
              ))}
            </div>
          </div>
          <div
            className="h-fit rounded-apple-xl space-y-4 p-6"
            style={{
              background: "#111109",
              border: "1px solid rgba(201,168,76,0.1)",
            }}
          >
            <div className="h-5 w-32 animate-pulse rounded" style={{ background: "#1A1A14" }} />
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded" style={{ background: "#1A1A14" }} />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-full animate-pulse rounded" style={{ background: "#1A1A14" }} />
                  <div className="h-3 w-2/3 animate-pulse rounded" style={{ background: "#1A1A14" }} />
                </div>
              </div>
            ))}
            <div className="mt-4 h-12 animate-pulse rounded-full" style={{ background: "#1A1A14" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
