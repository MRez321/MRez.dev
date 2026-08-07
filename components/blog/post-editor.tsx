"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Bold,
  CalendarClock,
  Check,
  Code,
  Columns2,
  Eye,
  FileCode,
  FileText,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  PenLine,
  Quote,
  Rocket,
  Save,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPost, updatePost } from "@/features/blog/api/actions";
import { slugify } from "@/features/blog/lib/slug";
import { MdxPreview } from "./mdx-preview";

type EditorPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: "draft" | "published" | "scheduled" | "archived";
  scheduledFor: Date | null;
  featured: boolean;
  tags: { name: string }[];
};

type ViewMode = "edit" | "split" | "preview";

function toLocalInput(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(
    date.getHours()
  )}:${p(date.getMinutes())}`;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", hint: "Keep working on it", Icon: FileText },
  { value: "scheduled", label: "Scheduled", hint: "Publish at a time", Icon: CalendarClock },
  { value: "published", label: "Published", hint: "Live on the blog", Icon: Rocket },
  { value: "archived", label: "Archived", hint: "Hidden from the blog", Icon: Archive },
] as const;

const VIEW_MODES: { value: ViewMode; label: string; Icon: typeof PenLine }[] = [
  { value: "edit", label: "Editor", Icon: PenLine },
  { value: "split", label: "Split", Icon: Columns2 },
  { value: "preview", label: "Preview", Icon: Eye },
];

export function PostEditor({
  post,
  notice,
}: {
  post?: EditorPost;
  notice?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<ViewMode>("split");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(
    notice ? { kind: "ok", text: notice } : null
  );

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [tagsInput, setTagsInput] = useState(post?.tags.map((t) => t.name).join(", ") ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [scheduledFor, setScheduledFor] = useState(
    post?.scheduledFor ? toLocalInput(post.scheduledFor) : ""
  );
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [content, setContent] = useState(post?.content ?? "");
  const [dirty, setDirty] = useState(false);
  const slugTouched = useRef(Boolean(post));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const statusOptions = STATUS_OPTIONS.filter(
    (s) => s.value !== "archived" || post?.status === "archived"
  );

  const words = useMemo(
    () => (content.trim() ? content.trim().split(/\s+/).length : 0),
    [content]
  );
  const readingTime = Math.max(1, Math.ceil(words / 200));

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched.current) setSlug(slugify(value));
    setDirty(true);
  }

  /** Wrap the selection (or a placeholder) in markdown. */
  function wrap(before: string, after: string, placeholder: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    setDirty(true);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  /** Toggle a line prefix (`## `, `> `, `- `) across the selected lines. */
  function toggleLinePrefix(prefix: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const nextBreak = content.indexOf("\n", end);
    const lineEnd = nextBreak === -1 ? content.length : nextBreak;
    const block = content.slice(lineStart, lineEnd);
    const lines = block.split("\n");
    const allPrefixed = lines.every((l) => l.startsWith(prefix));
    const next = content.slice(0, lineStart) + lines
      .map((l) => (allPrefixed ? l.slice(prefix.length) : prefix + l))
      .join("\n") + content.slice(lineEnd);
    setContent(next);
    setDirty(true);
    requestAnimationFrame(() => {
      ta.focus();
      const offset = allPrefixed ? -prefix.length : prefix.length;
      ta.setSelectionRange(
        Math.max(0, start + offset),
        Math.min(next.length, end + offset * lines.length)
      );
    });
  }

  function insert(kind: (typeof TOOLBAR)[number]["kind"]) {
    switch (kind) {
      case "h2":
        toggleLinePrefix("## ");
        break;
      case "bold":
        wrap("**", "**", "bold text");
        break;
      case "italic":
        wrap("_", "_", "italic text");
        break;
      case "quote":
        toggleLinePrefix("> ");
        break;
      case "list":
        toggleLinePrefix("- ");
        break;
      case "code":
        wrap("`", "`", "inline code");
        break;
      case "codeblock":
        wrap("```\n", "\n```", 'const example = "hello";');
        break;
      case "link":
        wrap("[", "](https://)", "link text");
        break;
      case "image":
        wrap("![", "](https://)", "alt text");
        break;
    }
  }

  const save = useCallback(() => {
    setMessage(null);
    const payload = {
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      excerpt: excerpt.trim() || null,
      coverImage: coverImage.trim() || null,
      content,
      status,
      scheduledFor: status === "scheduled" ? scheduledFor : null,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      featured,
    };

    startTransition(async () => {
      try {
        const result = post
          ? await updatePost(post.id, payload)
          : await createPost(payload);
        if (result.ok) {
          setDirty(false);
          if (!post) {
            router.push(`/dashboard/blog/${result.id}?created=1`);
          } else {
            setMessage({ kind: "ok", text: "Changes saved." });
            router.refresh();
          }
        } else {
          setMessage({ kind: "error", text: result.error });
        }
      } catch (err) {
        const e = err as { issues?: { message: string }[]; message?: string };
        setMessage({
          kind: "error",
          text: e.issues?.[0]?.message ?? e.message ?? "Something went wrong.",
        });
      }
    });
  }, [post, title, slug, excerpt, coverImage, content, status, scheduledFor, tagsInput, featured, router]);

  // ⌘S / Ctrl+S saves; the beforeunload guard stops accidental data loss.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save]);

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Auto-dismiss success feedback.
  useEffect(() => {
    if (message?.kind !== "ok") return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const saveLabel =
    status === "published" ? "Publish" : status === "scheduled" ? "Schedule" : "Save draft";
  const tagNames = useMemo(
    () => [...new Set(tagsInput.split(",").map((t) => t.trim()).filter(Boolean))],
    [tagsInput]
  );
  const liveSlug = slug || slugify(title) || "untitled";

  return (
    <div className="flex flex-col gap-6">
      {/* Floating save bar */}
      <div className="sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 p-3 shadow-sm backdrop-blur">
        <div className="flex min-w-0 items-center gap-2.5">
          {dirty ? (
            <Badge variant="outline" className="shrink-0 border-amber-500/40 text-amber-600 dark:text-amber-400">
              Unsaved
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">
              {post ? "Editing" : "New"}
            </Badge>
          )}
          <span className="hidden truncate text-xs text-muted-foreground sm:inline">
            {words} {words === 1 ? "word" : "words"} · {readingTime} min read
          </span>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span
              className={cn(
                "flex items-center gap-1 text-sm",
                message.kind === "ok" ? "text-emerald-500" : "text-destructive"
              )}
            >
              {message.kind === "ok" ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {message.text}
            </span>
          )}
          <Button onClick={save} disabled={isPending} size="lg">
            {isPending ? (
              "Saving…"
            ) : (
              <>
                <Save data-icon="inline-start" />
                {saveLabel}
                <kbd className="ml-1 rounded border border-current/25 px-1.5 font-mono text-[10px] font-normal opacity-70">
                  ⌘S
                </kbd>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content card */}
      <div className="flex flex-col gap-5 rounded-xl border bg-card p-5">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Post title"
            className="mt-1.5 h-12 text-lg font-semibold"
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                slugTouched.current = true;
                setSlug(slugify(e.target.value));
                setDirty(true);
              }}
              placeholder="my-post-slug"
              className="font-mono"
            />
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Link2 className="h-3 w-3" />
            <span className="font-mono">mrez.dev/blog/{liveSlug}</span>
          </p>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => {
              setTagsInput(e.target.value);
              setDirty(true);
            }}
            placeholder="Next.js, TypeScript"
            className="mt-1.5"
          />
          {tagNames.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tagNames.map((name) => (
                <Badge key={name} variant="secondary">
                  {name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => {
              setExcerpt(e.target.value);
              setDirty(true);
            }}
            rows={2}
            placeholder="Short summary shown on the blog listing (optional)"
            className="mt-1.5 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div>
          <Label htmlFor="cover">Cover image URL</Label>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <Input
              id="cover"
              value={coverImage}
              onChange={(e) => {
                setCoverImage(e.target.value);
                setDirty(true);
              }}
              placeholder="https://…/cover.png"
              className="max-w-md"
            />
            {coverImage.trim() && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage.trim()}
                alt="Cover preview"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className="h-14 w-24 rounded-lg border object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Publish card */}
      <div className="flex flex-col gap-5 rounded-xl border bg-card p-5">
        <div>
          <Label>Status</Label>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {statusOptions.map(({ value, label, hint, Icon }) => {
              const active = status === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setStatus(value);
                    setDirty(true);
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                      : "hover:border-ring hover:bg-muted/40"
                  )}
                  aria-pressed={active}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span className="flex flex-col">
                    <span className={cn("text-sm font-medium", active && "text-primary")}>
                      {label}
                    </span>
                    <span className="text-xs text-muted-foreground">{hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {status === "scheduled" && (
          <div>
            <Label htmlFor="scheduledFor">Publish at</Label>
            <Input
              id="scheduledFor"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => {
                setScheduledFor(e.target.value);
                setDirty(true);
              }}
              className="mt-1.5 max-w-xs"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Uses your local time. A past date publishes immediately.
            </p>
          </div>
        )}

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3">
          <span className="flex flex-col">
            <span className="text-sm font-medium">Featured post</span>
            <span className="text-xs text-muted-foreground">
              Shown first on the blog listing
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={featured}
            onClick={() => {
              setFeatured(!featured);
              setDirty(true);
            }}
            className={cn(
              "relative h-5 w-9 shrink-0 rounded-full transition-colors",
              featured ? "bg-primary" : "bg-input"
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
                featured && "translate-x-4"
              )}
            />
          </button>
        </label>
      </div>

      {/* Editor */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
          <div className="flex items-center gap-0.5">
            {TOOLBAR.map(({ kind, label, Icon }, i) => (
              <span key={kind} className="flex items-center gap-0.5">
                {i === 7 && <span className="mx-1.5 h-4 w-px bg-border" />}
                <button
                  type="button"
                  onClick={() => insert(kind)}
                  title={label}
                  aria-label={label}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-0.5">
            {VIEW_MODES.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  mode === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={cn("grid", mode === "split" ? "lg:grid-cols-2" : "grid-cols-1")}>
          {mode !== "preview" && (
            <div className={cn("relative", mode === "split" && "lg:border-r")}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setDirty(true);
                }}
                spellCheck={false}
                placeholder={
                  "Write markdown here…\n\n## Heading\n\nSome **bold** text and `inline code`.\n\n```ts\nconst x = 1;\n```"
                }
                className="h-[560px] w-full resize-none bg-transparent p-5 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          )}
          {mode !== "edit" && (
            <div className="h-[560px] overflow-y-auto bg-muted/30 p-5">
              <MdxPreview source={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TOOLBAR = [
  { kind: "h2", label: "Heading", Icon: Heading2 },
  { kind: "bold", label: "Bold", Icon: Bold },
  { kind: "italic", label: "Italic", Icon: Italic },
  { kind: "quote", label: "Quote", Icon: Quote },
  { kind: "list", label: "List", Icon: List },
  { kind: "code", label: "Inline code", Icon: Code },
  { kind: "codeblock", label: "Code block", Icon: FileCode },
  { kind: "link", label: "Link", Icon: Link2 },
  { kind: "image", label: "Image", Icon: ImageIcon },
] as const;
