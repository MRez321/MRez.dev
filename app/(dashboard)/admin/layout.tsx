import { requireAdmin } from "@/features/auth/api/guards";
import { roleOf } from "@/features/auth/permissions";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only admins can reach any /admin route — the generated nav below is
  // additionally permission-filtered per entry.
  const user = await requireAdmin();

  return (
    <div className="flex flex-col">
      <AdminNav role={roleOf(user.role)} />
      {children}
    </div>
  );
}
