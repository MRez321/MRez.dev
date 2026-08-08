import Link from "next/link";
import { BookOpen, FolderGit2, ImageIcon } from "lucide-react";
import { OptimizerApp } from "@/features/apps/image-optimizer/optimizer-app";

export const metadata = {
  title: "Image Optimizer — MRez",
  description:
    "Compress images right in your browser — WebP, JPEG, or PNG, with quality control and resizing. Nothing is uploaded.",
};

export default function ImageOptimizerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card">
            <ImageIcon className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Image Optimizer
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Shrink images and keep the detail. Pick a format, tune the quality,
              and download smaller files — all in your browser.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/docs/api"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <BookOpen className="size-4" />
            API
          </Link>
          <a
            href="https://github.com/MRez321/img-optimizer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FolderGit2 className="size-4" />
            Source
          </a>
        </div>
      </div>

      <OptimizerApp />

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Need optimization in your own product?{" "}
        <Link href="/docs/api" className="underline underline-offset-2 hover:text-foreground">
          Use the Image Optimizer API
        </Link>{" "}
        — server-side processing with API keys, rate limits, and monthly quotas.
      </p>
    </main>
  );
}
