"use client";

import { useState } from "react";
import { revokeApiKey } from "@/app/actions/api-keys";
import { Button } from "@/components/ui/button";

export function RevokeKeyButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRevoke() {
    const res = await revokeApiKey(id);
    if (!res.ok) {
      setError(res.error);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        type="button"
        variant={confirming ? "destructive" : "outline"}
        size="sm"
        disabled={disabled}
        onClick={() => {
          if (confirming) {
            void onRevoke();
          } else {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 3000);
          }
        }}
      >
        {confirming ? "Click to confirm revoke" : "Revoke"}
      </Button>
    </div>
  );
}
