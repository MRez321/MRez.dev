import { getAllPosts } from "@/features/blog/api/queries";
import { PostTable } from "@/components/blog/post-table";

export const metadata = { title: "Admin · Posts" };

export default async function AdminPostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
        <p className="text-sm text-muted-foreground">
          Every post, any status. Publish, edit, or delete from here.
        </p>
      </div>
      <PostTable
        posts={posts.map((p) => ({
          ...p,
          authorName: p.authorName,
          publishedAt: p.publishedAt?.toISOString() ?? null,
          scheduledFor: p.scheduledFor?.toISOString() ?? null,
          updatedAt: p.updatedAt.toISOString(),
        }))}
        showAuthor
        emptyMessage="No posts have been created yet."
      />
    </div>
  );
}
