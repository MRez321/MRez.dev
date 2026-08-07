import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/features/auth/api/guards";
import { can, roleOf } from "@/features/auth/permissions";
import { getPostById } from "@/features/blog/api/queries";
import { PostEditor } from "@/components/blog/post-editor";

export const metadata = { title: "Edit Post" };

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await requirePermission("post:edit:own");
  const post = await getPostById(id);
  if (!post) notFound();
  if (post.authorId !== user.id && !can(roleOf(user.role), "post:manage")) notFound();

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
        <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
        <p className="text-sm text-muted-foreground">
          /blog/{post.slug}
        </p>
      </div>
      <PostEditor
        notice={query.created === "1" ? "Post created." : undefined}
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          status: post.status,
          scheduledFor: post.scheduledFor,
          featured: post.featured,
          tags: post.tags.map((t) => ({ name: t.name })),
        }}
      />
    </div>
  );
}
