import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <DashboardNav />
      {children}
    </main>
  );
}
