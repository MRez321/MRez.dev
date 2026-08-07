import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { requireUser } from "@/features/auth/api/queries";
import { roleOf } from "@/features/auth/permissions";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireUser();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <DashboardNav role={roleOf(session.user.role)} />
      {children}
    </main>
  );
}
