import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAuthor } from "@/features/auth/api/guards";
import { getMyPosts } from "@/features/blog/api/queries";
import { PostTable } from "@/components/blog/post-table";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My Posts" };

export default async function MyPostsPage() {
  const user = await requireAuthor();
  const posts = await getMyPosts(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Posts</h1>
          <p className="text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? "post" : "posts"} · only you can see drafts
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/blog/new">
            <Plus className="mr-1.5 h-4 w-4" />
            New post
          </Link>
        </Button>
      </div>

      <PostTable
        posts={posts.map((p) => ({
          ...p,
          publishedAt: p.publishedAt?.toISOString() ?? null,
          scheduledFor: p.scheduledFor?.toISOString() ?? null,
          updatedAt: p.updatedAt.toISOString(),
        }))}
        emptyMessage="You haven't written anything yet. Click “New post” to start."
      />
    </div>
  );
}
