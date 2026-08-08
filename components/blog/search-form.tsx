"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";

export function BlogSearchForm({ initialQ }: { initialQ?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQ ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) trackEvent("search", { query: q });
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.push(params.size ? `/blog?${params.toString()}` : "/blog");
  }

  return (
    <form onSubmit={submit} className="relative max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search posts…"
        className="pl-9"
        aria-label="Search posts"
      />
    </form>
  );
}
