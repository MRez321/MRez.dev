import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold tracking-tight">403</p>
      <h1 className="text-xl font-semibold">You don&apos;t have access</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This area requires permissions your account doesn&apos;t have. If you
        believe this is a mistake, contact the site administrator.
      </p>
      <Link
        href="/"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        Back home
      </Link>
    </div>
  );
}
