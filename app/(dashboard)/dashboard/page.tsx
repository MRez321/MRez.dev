// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
            <p className="text-gray-600">Email: {session.user.email}</p>

            <form action={signOutAction} className="mt-6">
                <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Sign Out
                </button>
            </form>
        </div>
    );
}