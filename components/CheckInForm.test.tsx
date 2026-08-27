import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CheckInForm } from "@/components/CheckInForm";

describe("CheckInForm", () => {
  it("submits valid data through onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<CheckInForm onSubmit={onSubmit} />);

    const energyGroup = screen.getByRole("radiogroup", { name: "Energy" });
    const outputGroup = screen.getByRole("radiogroup", { name: "Output" });

    await user.click(within(energyGroup).getByRole("radio", { name: "4" }));
    await user.click(within(outputGroup).getByRole("radio", { name: "3" }));
    await user.type(
      screen.getByPlaceholderText("Anything worth noting about today..."),
      "  Good deep-work block  ",
    );
    await user.click(screen.getByRole("button", { name: "Save check-in" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      energyLevel: 4,
      outputLevel: 3,
      note: "Good deep-work block",
    });
  });
});
