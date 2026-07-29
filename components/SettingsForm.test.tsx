import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SettingsForm, { settingsFormSchema } from "./SettingsForm";

describe("settingsFormSchema (validation logic)", () => {
  it("accepts valid input", () => {
    const result = settingsFormSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      notifications: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing/empty name", () => {
    const result = settingsFormSchema.safeParse({
      name: "",
      email: "ada@example.com",
      notifications: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["name"]);
      expect(result.error.issues[0].message).toMatch(/required/i);
    }
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = settingsFormSchema.safeParse({
      name: "A",
      email: "ada@example.com",
      notifications: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/at least 2 characters/i);
    }
  });

  it("rejects an invalid email format", () => {
    const result = settingsFormSchema.safeParse({
      name: "Ada Lovelace",
      email: "not-an-email",
      notifications: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["email"]);
      expect(result.error.issues[0].message).toMatch(/valid email/i);
    }
  });
});

describe("<SettingsForm /> (integration)", () => {
  it("submits successfully with valid input", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<SettingsForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.click(screen.getByLabelText(/enable notifications/i));
    await user.click(screen.getByRole("button", { name: /save settings/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: "Ada Lovelace",
        email: "ada@example.com",
        notifications: true,
      });
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an inline error and blocks submit when name is missing", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<SettingsForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.click(screen.getByRole("button", { name: /save settings/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/name is required/i);

    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput).toHaveAttribute("aria-describedby", alert.id);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("shows an inline error and blocks submit when email is invalid", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<SettingsForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /save settings/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/valid email/i);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", alert.id);

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
