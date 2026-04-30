"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User } from "lucide-react";
import { localizedPath, type Locale } from "@/lib/i18n/config";

interface NavUserProps {
  session: { id: string; name?: string | null; role: string } | null;
  locale: Locale;
  labels: {
    account: string;
    admin: string;
    login: string;
  };
}

const iconShellStyle = {
  background: "rgba(17,17,9,0.84)",
  border: "1px solid rgba(201,168,76,0.14)",
  color: "var(--color-text)",
  backdropFilter: "blur(14px)",
} as const;

export function NavUser({ session, locale, labels }: NavUserProps) {
  const pathname = usePathname();
  const loginUrl = localizedPath(
    `/auth/login?redirect=${encodeURIComponent(pathname)}`,
    locale
  );

  return (
    <div className="flex items-center gap-1.5">
      {session ? (
        <>
          {["ADMIN", "STAFF"].includes(session.role) && (
            <Link
              href={localizedPath("/admin", locale)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300"
              aria-label={labels.admin}
              style={iconShellStyle}
            >
              <LayoutDashboard className="h-4 w-4" strokeWidth={1.9} />
            </Link>
          )}
          <Link
            href={localizedPath("/store/account", locale)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300"
            aria-label={labels.account}
            style={iconShellStyle}
          >
            <User className="h-4 w-4" strokeWidth={1.9} />
          </Link>
        </>
      ) : (
        <Link
          href={loginUrl}
          className="rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.28em] transition-all duration-300"
          style={{
            background: "rgba(17,17,9,0.76)",
            border: "1px solid rgba(201,168,76,0.14)",
            color: "var(--color-text-secondary)",
            backdropFilter: "blur(14px)",
          }}
        >
          {labels.login}
        </Link>
      )}
    </div>
  );
}
