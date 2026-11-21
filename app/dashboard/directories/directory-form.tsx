"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "./actions";

interface DirectoryFormProps {
  initialData?: {
    id?: number;
    area: string;
    district: string;
    country: string;
    thana: string;
  };
  action: (prev: ActionState | null, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  cancelHref?: string;
}

export function DirectoryForm({
  initialData,
  action,
  submitLabel,
  cancelHref = "/dashboard/directories",
}: DirectoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state?.error && (
        <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
          {state.error}
        </div>
      )}

      <div>
        <Label htmlFor="area">Area *</Label>
        <Input id="area" name="area" defaultValue={initialData?.area ?? ""} required minLength={1} maxLength={100} />
        {state?.fieldErrors?.area && (
          <p className="text-sm text-destructive mt-1">{state.fieldErrors.area[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="district">District *</Label>
        <Input id="district" name="district" defaultValue={initialData?.district ?? ""} required minLength={1} maxLength={100} />
      </div>

      <div>
        <Label htmlFor="thana">Thana *</Label>
        <Input id="thana" name="thana" defaultValue={initialData?.thana ?? ""} required minLength={1} maxLength={100} />
      </div>

      <div>
        <Label htmlFor="country">Country *</Label>
        <Input id="country" name="country" defaultValue={initialData?.country ?? "Bangladesh"} required minLength={1} maxLength={100} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
        <Link href={cancelHref}>
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  );
}