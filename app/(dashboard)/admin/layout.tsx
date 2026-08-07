import { requireAdmin } from "@/features/auth/api/guards";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <div className="flex flex-col">
      <AdminNav />
      {children}
    </div>
  );
}
