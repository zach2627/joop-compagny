"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  type?: ToastType;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}

interface ToastMessage extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  showToast: (opts: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((opts: ToastOptions) => {
    const id = `t${++counter.current}`;
    setToasts((prev) => [...prev, { ...opts, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-6 right-4 z-[9999] flex max-w-[min(360px,calc(100vw-2rem))] flex-col-reverse gap-2 md:right-6"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  const isError = toast.type === "error";
  const accentColor = isError ? "#ff7070" : "#C9A84C";

  return (
    <div
      role="status"
      className="pointer-events-auto toast-slide-in"
      style={{
        background: "#111109",
        borderLeft: `2px solid ${accentColor}`,
        borderRadius: "16px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.54), 0 0 0 1px rgba(201,168,76,0.08)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        minWidth: "260px",
      }}
    >
      <span
        aria-hidden="true"
        style={{ color: accentColor, fontSize: "0.6rem", marginTop: "3px", flexShrink: 0 }}
      >
        ✦
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="text-sm font-medium" style={{ color: "#fffdf8", lineHeight: 1.4 }}>
          {toast.title}
        </p>
        {toast.subtitle ? (
          <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.52)", lineHeight: 1.4 }}>
            {toast.subtitle}
          </p>
        ) : null}
      </div>
      {toast.action ? (
        <Link
          href={toast.action.href}
          className="shrink-0 text-xs font-semibold"
          style={{ color: "#C9A84C" }}
          onClick={onDismiss}
        >
          {toast.action.label} →
        </Link>
      ) : null}
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-base leading-none"
        style={{ color: "rgba(255,255,255,0.24)" }}
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  );
}
