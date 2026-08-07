"use client";

import { useActionState } from "react";
import { updateDisplayName } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NameForm({ currentName }: { currentName: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { ok: boolean; error?: string } | null, formData: FormData) => {
      return updateDisplayName(formData);
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div>
        <Label htmlFor="name">Display name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={currentName}
          maxLength={60}
          required
          className="mt-1.5 max-w-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save name"}
        </Button>
        {state?.ok && <span className="text-sm text-emerald-500">Saved.</span>}
        {state && !state.ok && (
          <span className="text-sm text-destructive">{state.error}</span>
        )}
      </div>
    </form>
  );
}
