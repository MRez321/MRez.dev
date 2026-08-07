import { getAllUsers } from "@/features/auth/api/queries";
import { UsersTable } from "@/components/admin/users-table";

export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} registered {users.length === 1 ? "user" : "users"} · assign
          roles or ban accounts
        </p>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
