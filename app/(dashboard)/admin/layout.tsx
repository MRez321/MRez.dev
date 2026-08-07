import { requireUser } from "@/features/auth/api/queries";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser();

  return <>{children}</>;
}
