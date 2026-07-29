import { z } from "zod";

export const TIMEZONES = [
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
] as const;

export const settingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be 50 characters or less"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  bio: z
    .string()
    .trim()
    .max(280, "Bio must be 280 characters or less")
    .optional()
    .or(z.literal("")),
  timezone: z.enum(
    TIMEZONES.map((tz) => tz.value) as [string, ...string[]],
    { required_error: "Select a timezone" },
  ),
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

export const defaultSettingsValues: SettingsFormValues = {
  displayName: "",
  email: "",
  bio: "",
  timezone: "America/Los_Angeles",
  emailNotifications: true,
  marketingEmails: false,
};

export const mockSavedSettings: SettingsFormValues = {
  displayName: "Alex Rivera",
  email: "alex@flyrank.dev",
  bio: "Frontend engineer building accessible, production-quality UIs.",
  timezone: "America/New_York",
  emailNotifications: true,
  marketingEmails: false,
};
