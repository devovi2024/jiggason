"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "./actions";

interface CompanyFormProps {
  directoryId: number;
  cancelHref: string;
  initialData?: {
    id?: number;
    name: string;
    website?: string | null;
    type: string;
    location: string;
    area: string;
    thana: string;
    district: string;
    country: string;
    services?: string[];
    email?: string | null;
    phone?: string | null;
    verification_status: string;
    job_status: string;
  };
  action: (prev: ActionState | null, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}

export function CompanyForm({
  directoryId,
  cancelHref,
  initialData,
  action,
  submitLabel,
}: CompanyFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4 max-w-3xl">
      {state?.error && (
        <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
          {state.error}
        </div>
      )}

      <input type="hidden" name="directoryId" value={directoryId} />

      <div>
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" defaultValue={initialData?.name ?? ""} required minLength={2} maxLength={200} />
        {state?.fieldErrors?.name && (
          <p className="text-sm text-destructive mt-1">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" type="url" defaultValue={initialData?.website ?? ""} maxLength={500} placeholder="https://example.com" />
      </div>

      <div>
        <Label htmlFor="type">Type *</Label>
        <Input id="type" name="type" defaultValue={initialData?.type ?? ""} required minLength={1} maxLength={200} placeholder="Software Development, IT Services" />
      </div>

      <div>
        <Label htmlFor="location">Location *</Label>
        <Input id="location" name="location" defaultValue={initialData?.location ?? ""} required minLength={1} maxLength={500} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="area">Area *</Label>
          <Input id="area" name="area" defaultValue={initialData?.area ?? ""} required minLength={1} maxLength={100} />
        </div>
        <div>
          <Label htmlFor="thana">Thana *</Label>
          <Input id="thana" name="thana" defaultValue={initialData?.thana ?? ""} required minLength={1} maxLength={100} />
        </div>
        <div>
          <Label htmlFor="district">District *</Label>
          <Input id="district" name="district" defaultValue={initialData?.district ?? ""} required minLength={1} maxLength={100} />
        </div>
        <div>
          <Label htmlFor="country">Country *</Label>
          <Input id="country" name="country" defaultValue={initialData?.country ?? "Bangladesh"} required minLength={1} maxLength={100} />
        </div>
      </div>

      <div>
        <Label htmlFor="services">Services (comma-separated)</Label>
        <Input id="services" name="services" defaultValue={(initialData?.services ?? []).join(", ")} maxLength={2000} placeholder="Web Development, Mobile App, UI/UX" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={initialData?.email ?? ""} maxLength={200} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={initialData?.phone ?? ""} maxLength={50} />
        </div>
      </div>

      <div>
        <Label htmlFor="verification_status">Verification Status *</Label>
        <Input id="verification_status" name="verification_status" defaultValue={initialData?.verification_status ?? ""} required minLength={1} maxLength={200} placeholder="Strong, Historical, Needs verification" />
      </div>

      <div>
        <Label htmlFor="job_status">Job Status *</Label>
        <Input id="job_status" name="job_status" defaultValue={initialData?.job_status ?? ""} required minLength={1} maxLength={200} placeholder="Active vacancy, No vacancy confirmed" />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}