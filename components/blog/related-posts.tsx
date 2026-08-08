import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRelatedPosts, type PostWithMeta } from "@/features/blog/api/queries";
import { PostCard } from "@/components/blog/post-card";

export async function RelatedPosts({ post }: { post: PostWithMeta }) {
  const related = await getRelatedPosts(post, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Related posts</h2>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          All posts
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
