"use client";

const PARTICLES = [
  { left: "6%", top: "14%", delay: "0s", dur: "4.4s" },
  { left: "16%", top: "72%", delay: "0.8s", dur: "5.2s" },
  { left: "32%", top: "20%", delay: "1.5s", dur: "3.9s" },
  { left: "48%", top: "58%", delay: "2.1s", dur: "4.8s" },
  { left: "68%", top: "30%", delay: "0.4s", dur: "5.6s" },
  { left: "78%", top: "80%", delay: "1.1s", dur: "4.1s" },
  { left: "88%", top: "10%", delay: "2.6s", dur: "3.7s" },
  { left: "94%", top: "50%", delay: "0.6s", dur: "5.0s" },
  { left: "22%", top: "44%", delay: "1.8s", dur: "4.5s" },
  { left: "58%", top: "88%", delay: "3.2s", dur: "4.2s" },
];

export function GoldParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          style={{
            position: "absolute",
            left: particle.left,
            top: particle.top,
            color: "rgba(201,168,76,0.5)",
            fontSize: "0.65rem",
            animationName: "gold-float",
            animationDuration: particle.dur,
            animationDelay: particle.delay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            userSelect: "none",
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

export function RotatingBorderAside({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", borderRadius: "36px", padding: "2px" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "36px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-50%",
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(201,168,76,0.65) 55deg, transparent 160deg, rgba(201,168,76,0.15) 220deg, transparent 360deg)",
            animationName: "rotate-conic",
            animationDuration: "7s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        />
      </div>
      <div style={{ position: "relative", borderRadius: "34px", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
