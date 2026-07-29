"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Validation schema for the settings form.
 * Exported so it can be reused/unit-tested independently of the component.
 */
export const settingsFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  notifications: z.boolean(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export interface SettingsFormProps {
  /** Initial values for the form fields. */
  defaultValues?: Partial<SettingsFormValues>;
  /** Called with the validated data on successful submit. */
  onSubmit?: (values: SettingsFormValues) => void | Promise<void>;
}

const DEFAULT_VALUES: SettingsFormValues = {
  name: "",
  email: "",
  notifications: false,
};

export default function SettingsForm({
  defaultValues,
  onSubmit,
}: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
    mode: "onBlur",
  });

  const formId = useId();
  const nameErrorId = `${formId}-name-error`;
  const emailErrorId = `${formId}-email-error`;

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit?.(values);
  });

  return (
    <form
      onSubmit={submitHandler}
      noValidate
      aria-label="Account settings"
      className="mx-auto flex w-full max-w-md flex-col gap-6"
    >
      {/* Name field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-name`} className="text-sm font-medium text-slate-900">
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${formId}-name`}
          type="text"
          autoComplete="name"
          aria-required="true"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? nameErrorId : undefined}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 aria-[invalid=true]:border-red-500"
          {...register("name")}
        />
        {errors.name && (
          <p id={nameErrorId} role="alert" className="text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-email`} className="text-sm font-medium text-slate-900">
          Email <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${formId}-email`}
          type="email"
          autoComplete="email"
          aria-required="true"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? emailErrorId : undefined}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 aria-[invalid=true]:border-red-500"
          {...register("email")}
        />
        {errors.email && (
          <p id={emailErrorId} role="alert" className="text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Notifications toggle */}
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={`${formId}-notifications`} className="text-sm font-medium text-slate-900">
          Enable notifications
        </label>
        <input
          id={`${formId}-notifications`}
          type="checkbox"
          role="switch"
          className="h-5 w-5 rounded border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
          {...register("notifications")}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
