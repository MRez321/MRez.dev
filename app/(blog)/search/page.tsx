import { BlogSearchForm } from "@/components/blog/search-form";

export const metadata = {
  title: "Search",
  description: "Search the MRez blog.",
};

export default function SearchPage() {
  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-16 text-center sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Search the blog</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Find posts by title, excerpt, or content.
      </p>
      <div className="mt-6 flex justify-center">
        <BlogSearchForm />
      </div>
    </div>
  );
}
