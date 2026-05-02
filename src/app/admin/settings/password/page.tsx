import { redirect } from "next/navigation";
import { AdminPasswordChangeForm } from "@/components/admin/AdminPasswordChangeForm";
import { getServerSession } from "@/lib/auth/jwt";

export const metadata = {
  title: "Changer le mot de passe",
};

export default async function AdminPasswordSettingsPage() {
  const session = await getServerSession();

  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8 p-8">
      <AdminPasswordChangeForm userEmail={session.email} />
    </div>
  );
}
