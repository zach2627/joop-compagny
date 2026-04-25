// src/app/admin/layout.tsx
import LogoutButton from "@/components/admin/LogoutButton";
import Link from "next/link";
import { getServerSession } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  ImageIcon,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    redirect("/auth/login");
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
    { href: "/admin/produits", icon: Package, label: "Produits" },
    { href: "/admin/commandes", icon: ShoppingBag, label: "Commandes" },
    { href: "/admin/customers", icon: Users, label: "Clients" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytiques" },
    { href: "/admin/banners", icon: ImageIcon, label: "Bannieres" },
    ...(session.role === "ADMIN"
      ? [{ href: "/admin/settings", icon: Settings, label: "Parametres" }]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-apple-gray-50">
      <aside
        className="fixed top-0 left-0 bottom-0 w-[240px] bg-apple-gray-900 text-white
                   flex flex-col z-40"
      >
        <div className="p-6 border-b border-white/10">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">
            Administration
          </p>
          <p className="font-bold text-white">{siteConfig.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-apple-md text-sm
                         text-white/70 hover:text-white hover:bg-white/10 transition-colors
                         group"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-apple-blue flex items-center justify-center text-xs font-bold">
              {session.name?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.name ?? session.email}
              </p>
              <p className="text-xs text-white/50">{session.role}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="ml-[240px] flex-1 min-h-screen">{children}</main>
    </div>
  );
}
