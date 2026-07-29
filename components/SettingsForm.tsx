"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckboxInput,
  FieldWrapper,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/form/Field";
import {
  defaultSettingsValues,
  mockSavedSettings,
  settingsSchema,
  TIMEZONES,
  type SettingsFormValues,
} from "@/lib/settings-schema";
import { cn, getErrorMessage } from "@/lib/utils";

type SubmitState = "idle" | "loading" | "success" | "error";

export function SettingsForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettingsValues,
    mode: "onBlur",
  });

  const bioValue = watch("bio") ?? "";

  async function onSubmit(values: SettingsFormValues) {
    setSubmitState("loading");
    setSubmitError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      console.info("Settings saved:", values);
      reset(values);
      setSubmitState("success");
    } catch (error) {
      setSubmitState("error");
      setSubmitError(getErrorMessage(error));
    }
  }

  function handleReset() {
    reset(mockSavedSettings);
    setSubmitState("idle");
    setSubmitError(null);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-2xl space-y-8"
    >
      <section aria-labelledby="profile-heading" className="space-y-5">
        <div>
          <h2 id="profile-heading" className="text-lg font-semibold text-foreground">
            Profile
          </h2>
          <p className="mt-1 text-sm text-muted">
            Update how you appear across FlyRank.
          </p>
        </div>

        <FieldWrapper
          id="displayName"
          label="Display name"
          error={errors.displayName?.message}
          hint="Shown on your public profile."
        >
          <TextInput
            id="displayName"
            autoComplete="name"
            placeholder="Alex Rivera"
            error={errors.displayName?.message}
            {...register("displayName")}
          />
        </FieldWrapper>

        <FieldWrapper
          id="email"
          label="Email address"
          error={errors.email?.message}
          hint="Used for login and account notifications."
        >
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </FieldWrapper>

        <FieldWrapper
          id="bio"
          label="Bio"
          error={errors.bio?.message}
          hint={`${bioValue.length}/280 characters`}
        >
          <TextArea
            id="bio"
            placeholder="Tell us a little about yourself..."
            error={errors.bio?.message}
            {...register("bio")}
          />
        </FieldWrapper>
      </section>

      <section aria-labelledby="preferences-heading" className="space-y-5">
        <div>
          <h2 id="preferences-heading" className="text-lg font-semibold text-foreground">
            Preferences
          </h2>
          <p className="mt-1 text-sm text-muted">
            Choose your timezone and notification settings.
          </p>
        </div>

        <FieldWrapper
          id="timezone"
          label="Timezone"
          error={errors.timezone?.message}
        >
          <SelectInput
            id="timezone"
            options={TIMEZONES}
            error={errors.timezone?.message}
            {...register("timezone")}
          />
        </FieldWrapper>

        <fieldset className="space-y-3">
          <legend className="sr-only">Notification preferences</legend>

          <CheckboxInput
            id="emailNotifications"
            label="Email notifications"
            description="Receive alerts for account activity and security updates."
            {...register("emailNotifications")}
          />

          <CheckboxInput
            id="marketingEmails"
            label="Product updates"
            description="Occasional emails about new FlyRank features."
            {...register("marketingEmails")}
          />
        </fieldset>
      </section>

      {submitState === "success" ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
        >
          Settings saved successfully.
        </p>
      ) : null}

      {submitState === "error" && submitError ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className={cn(
            "rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            isSubmitting || !isDirty
              ? "cursor-not-allowed bg-primary/50"
              : "bg-primary hover:bg-primary-hover",
          )}
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Load sample data
        </button>
      </div>
    </form>
  );
}
