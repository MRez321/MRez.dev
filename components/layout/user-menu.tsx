"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { signOutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CreditCard,
  FilePenLine,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Shield,
  Star,
  UserRound,
} from "lucide-react";
import { can, roleOf } from "@/features/auth/permissions";

type InitialUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string;
};

const MENU_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", Icon: UserRound },
  { href: "/dashboard/billing", label: "Billing", Icon: CreditCard },
  { href: "/dashboard/api-keys", label: "API Keys", Icon: KeyRound },
  { href: "/dashboard/favorites", label: "Favorites", Icon: Star },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserMenu({ initialUser }: { initialUser: InitialUser }) {
  const { data: session } = authClient.useSession();
  const user = session?.user ?? initialUser;
  const role = roleOf(user.role);

  const items = [...MENU_ITEMS];
  if (can(role, "post:create")) {
    items.push({ href: "/dashboard/blog", label: "My posts", Icon: FilePenLine });
  }
  if (can(role, "admin:access")) {
    items.push({ href: "/admin", label: "Admin", Icon: Shield });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open account menu"
        >
          <Avatar size="sm">
            {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map(({ href, label, Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href} className="cursor-pointer">
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/signin"
        className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        Sign up
      </Link>
    </div>
  );
}
