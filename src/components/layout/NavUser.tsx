"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LayoutDashboard } from "lucide-react";
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

export function NavUser({ session, locale, labels }: NavUserProps) {
  const pathname = usePathname();
  const loginUrl = localizedPath(
    `/auth/login?redirect=${encodeURIComponent(pathname)}`,
    locale
  );

  return (
    <div className="flex items-center gap-1">
      {session ? (
        <>
          {["ADMIN", "STAFF"].includes(session.role) && (
            <Link
              href={localizedPath("/admin", locale)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={labels.admin}
            >
              <LayoutDashboard className="w-5 h-5 text-white" />
            </Link>
          )}
          <Link
            href={localizedPath("/store/account", locale)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label={labels.account}
          >
            <User className="w-5 h-5 text-white" />
          </Link>
        </>
      ) : (
        <Link
          href={loginUrl}
          className="text-sm text-[rgba(255,255,255,0.6)] hover:text-white px-3 py-1.5
                     rounded-full hover:bg-white/10 transition-colors"
        >
          {labels.login}
        </Link>
      )}
    </div>
  );
}

