"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  FileImage,
  Loader2,
  Trash2,
  UploadCloud,
  XCircle,
  Zap,
} from "lucide-react";
import {
  optimizeImageInBrowser,
  outputFileName,
  formatBytes,
  type ClientFormat,
  type OptimizeResult,
} from "./client";
import { buildZip, downloadBlob } from "./zip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FileStatus = "queued" | "processing" | "done" | "error";

type QueuedFile = {
  id: string;
  file: File;
  status: FileStatus;
  result?: OptimizeResult;
  error?: string;
  previewUrl?: string;
};

const FORMATS: { value: ClientFormat; label: string }[] = [
  { value: "webp", label: "WebP" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
];

export function OptimizerApp() {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [format, setFormat] = useState<ClientFormat>("webp");
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState("");
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [zipping, setZipping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setQueue((prev) => {
      const next = [...prev];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        next.push({
          id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          status: "queued",
          previewUrl: URL.createObjectURL(file),
        });
      }
      return next;
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setQueue((prev) => {
      for (const f of prev) if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      return [];
    });
  }, []);

  const compressAll = useCallback(async () => {
    if (running) return;
    setRunning(true);
    const width = maxWidth.trim() ? Math.max(1, Math.min(16384, Number(maxWidth) || 0)) : null;

    setQueue((prev) =>
      prev.map((f) =>
        f.status === "queued" || f.status === "error" ? { ...f, status: "queued", error: undefined } : f
      )
    );

    // Process sequentially so the main thread stays responsive per file.
    for (const entry of queue) {
      if (entry.status === "done") continue;
      setQueue((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: "processing" } : f))
      );
      try {
        const result = await optimizeImageInBrowser(entry.file, { format, quality, maxWidth: width });
        setQueue((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, status: "done", result } : f))
        );
      } catch (err) {
        setQueue((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "error", error: (err as Error).message }
              : f
          )
        );
      }
    }
    setRunning(false);
  }, [format, maxWidth, quality, queue, running]);

  const downloadZip = useCallback(async () => {
    const done = queue.filter((f) => f.status === "done" && f.result);
    if (done.length === 0 || zipping) return;
    setZipping(true);
    try {
      const zip = await buildZip(
        done.map((f) => ({ name: outputFileName(f.file.name, format), blob: f.result!.blob }))
      );
      downloadBlob(zip, "optimized-images.zip");
    } finally {
      setZipping(false);
    }
  }, [format, queue, zipping]);

  const stats = useMemo(() => {
    const done = queue.filter((f) => f.result);
    const original = done.reduce((sum, f) => sum + f.result!.originalBytes, 0);
    const optimized = done.reduce((sum, f) => sum + f.result!.optimizedBytes, 0);
    const savings = original > 0 ? Math.round((1 - optimized / original) * 100) : 0;
    return { count: done.length, original, optimized, savings };
  }, [queue]);

  const queuedCount = queue.length;
  const workCount = queue.filter((f) => f.status === "queued" || f.status === "error").length;
  const canZip = stats.count > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Left: dropzone + files */}
      <div className="space-y-4">
        <div
          role="button"
          tabIndex={0}
          aria-label="Add images"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(Array.from(e.dataTransfer.files));
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-ring/60"
          )}
        >
          <UploadCloud className={cn("size-8", dragging ? "text-primary" : "text-muted-foreground")} />
          <p className="text-sm font-medium">
            {dragging ? "Drop to add" : "Drag & drop images here"}
          </p>
          <p className="text-xs text-muted-foreground">
            or click to browse · JPEG, PNG, WebP, GIF, TIFF, SVG · animated GIFs flatten to their
            first frame
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </div>

        {queuedCount > 0 && (
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Files ({queuedCount})</CardTitle>
                <CardDescription>
                  {stats.count > 0
                    ? `${formatBytes(stats.original)} → ${formatBytes(stats.optimized)} · ${stats.savings}% smaller`
                    : "Ready to compress"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1 text-muted-foreground">
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {queue.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
                >
                  {entry.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.previewUrl}
                      alt=""
                      className="size-9 shrink-0 rounded-md border object-cover"
                    />
                  ) : (
                    <FileImage className="size-9 shrink-0 rounded-md p-1 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{entry.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.status === "done" && entry.result
                        ? `${formatBytes(entry.result.originalBytes)} → ${formatBytes(entry.result.optimizedBytes)} · ${entry.result.width}×${entry.result.height}`
                        : entry.status === "processing"
                          ? "Optimizing…"
                          : entry.status === "error"
                            ? entry.error ?? "Failed"
                            : formatBytes(entry.file.size)}
                    </p>
                  </div>
                  {entry.status === "done" && entry.result && (
                    <>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                          entry.result.optimizedBytes < entry.result.originalBytes
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        -
                        {Math.round(
                          (1 - entry.result.optimizedBytes / entry.result.originalBytes) * 100
                        )}
                        %
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Download ${entry.file.name}`}
                        onClick={() =>
                          downloadBlob(entry.result!.blob, outputFileName(entry.file.name, format))
                        }
                      >
                        <ArrowDownToLine className="size-3.5" />
                      </Button>
                    </>
                  )}
                  {entry.status === "processing" && (
                    <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                  )}
                  {entry.status === "queued" && (
                    <span className="text-xs text-muted-foreground">queued</span>
                  )}
                  {entry.status === "error" && (
                    <XCircle className="size-4 shrink-0 text-destructive" />
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${entry.file.name}`}
                    onClick={() => removeFile(entry.id)}
                    className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: options */}
      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="size-4 text-primary" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium">Output format</p>
            <div className="grid grid-cols-3 gap-1 rounded-lg border bg-muted/50 p-1">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                    format === f.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              WebP is the best web default. JPEG for photos, PNG for screenshots and logos.
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="quality" className="text-sm font-medium">
                Quality
              </label>
              <span className="font-mono text-xs text-muted-foreground">{quality}</span>
            </div>
            <input
              id="quality"
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-primary"
            />
            {format === "png" && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                PNG is lossless — quality is not applied.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="max-width" className="text-sm font-medium">
              Max width <span className="text-muted-foreground">(px, optional)</span>
            </label>
            <input
              id="max-width"
              type="number"
              min={1}
              max={16384}
              value={maxWidth}
              onChange={(e) => setMaxWidth(e.target.value)}
              placeholder="e.g. 1600"
              className="mt-1.5 h-8 w-full rounded-lg border bg-background px-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Images wider than this are scaled down, keeping the aspect ratio.
            </p>
          </div>

          <Button
            onClick={compressAll}
            disabled={running || workCount === 0}
            className="w-full gap-1.5"
          >
            {running ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Zap className="size-4" />
            )}
            {running
              ? "Compressing…"
              : workCount > 0
                ? `Compress ${workCount} file${workCount === 1 ? "" : "s"}`
                : "Add images first"}
          </Button>

          {canZip && (
            <Button variant="secondary" onClick={downloadZip} disabled={zipping} className="w-full gap-1.5">
              {zipping ? <Loader2 className="size-4 animate-spin" /> : <ArrowDownToLine className="size-4" />}
              {zipping ? "Building ZIP…" : `Download ZIP (${formatBytes(stats.optimized)})`}
            </Button>
          )}

          <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Everything runs in your browser — images never leave your device. Metadata and EXIF
              data are stripped automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
