"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/auth/login");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-apple-md text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Déconnexion
    </button>
  );
}
