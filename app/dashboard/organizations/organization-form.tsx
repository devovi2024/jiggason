"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "./actions";

interface OrganizationFormProps {
  initialData?: {
    id?: number;
    kind: string;
    name: string;
    org?: string | null;
    website?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  action: (
    prev: ActionState | null,
    formData: FormData
  ) => Promise<ActionState>;
  submitLabel: string;
}

export function OrganizationForm({
  initialData,
  action,
  submitLabel,
}: OrganizationFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      {state?.error && (
        <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
          {state.error}
        </div>
      )}

      <div>
        <Label htmlFor="kind">Kind *</Label>
        <select
          id="kind"
          name="kind"
          defaultValue={initialData?.kind ?? "govt"}
          required
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        >
          <option value="govt">Government</option>
          <option value="nongovt">Non-Government</option>
        </select>
        {state?.fieldErrors?.kind && (
          <p className="text-sm text-destructive mt-1">
            {state.fieldErrors.kind[0]}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name ?? ""}
          required
          minLength={2}
          maxLength={200}
        />
        {state?.fieldErrors?.name && (
          <p className="text-sm text-destructive mt-1">
            {state.fieldErrors.name[0]}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="org">Organization / Parent</Label>
        <Input
          id="org"
          name="org"
          defaultValue={initialData?.org ?? ""}
          maxLength={200}
        />
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="url"
          defaultValue={initialData?.website ?? ""}
          maxLength={500}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={initialData?.email ?? ""}
          maxLength={200}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={initialData?.phone ?? ""}
          maxLength={50}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
        <Link href="/dashboard/organizations">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}