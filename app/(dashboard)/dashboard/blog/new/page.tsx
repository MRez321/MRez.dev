import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuthor } from "@/features/auth/api/guards";
import { PostEditor } from "@/components/blog/post-editor";

export const metadata = { title: "New Post" };

export default async function NewPostPage() {
  await requireAuthor();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/blog"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          My posts
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New Post</h1>
        <p className="text-sm text-muted-foreground">
          Write in Markdown + MDX. The preview compiles live as you type — ⌘S saves.
        </p>
      </div>
      <PostEditor />
    </div>
  );
}
