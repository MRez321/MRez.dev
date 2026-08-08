import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <FileQuestion className="h-7 w-7" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/blog">Browse the blog</Link>
        </Button>
      </div>
    </main>
  );
}
