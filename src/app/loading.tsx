// src/app/loading.tsx
// Root-level loading skeleton — shown during page transitions.

export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0A0A08" }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Spinner */}
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{
            borderColor: "rgba(201,168,76,0.2)",
            borderTopColor: "#C9A84C",
          }}
        />
        {/* Logo text */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: "#C9A84C" }}>
            JOOP
          </span>
          <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
            COMPANY
          </span>
        </div>
      </div>
    </div>
  );
}
