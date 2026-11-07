import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RoutineForm } from "@/components/RoutineForm";

describe("RoutineForm", () => {
  it("disables saving until at least one task is added", () => {
    render(<RoutineForm submitLabel="Save routine" onSave={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Save routine" })).toBeDisabled();
    expect(
      screen.getByText("Add at least one anchor task before saving."),
    ).toBeInTheDocument();
  });

  it("keeps the Add button disabled for blank input", async () => {
    const user = userEvent.setup();
    render(<RoutineForm submitLabel="Save routine" onSave={vi.fn()} />);

    await user.type(screen.getByLabelText("Anchor tasks"), "   ");

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("adds several tasks and clears the input after each one", async () => {
    const user = userEvent.setup();
    render(<RoutineForm submitLabel="Save routine" onSave={vi.fn()} />);

    const input = screen.getByLabelText("Anchor tasks");

    await user.type(input, "Write for 30 minutes");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(input).toHaveValue("");

    await user.type(input, "Evening walk{Enter}");

    expect(screen.getByText("Write for 30 minutes")).toBeInTheDocument();
    expect(screen.getByText("Evening walk")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Save routine" })).toBeEnabled();
  });

  it("removes a single task without touching the others", async () => {
    const user = userEvent.setup();
    render(
      <RoutineForm
        submitLabel="Save routine"
        initialItems={["Write", "Walk"]}
        onSave={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Remove Write" }));

    expect(screen.queryByText("Write")).not.toBeInTheDocument();
    expect(screen.getByText("Walk")).toBeInTheDocument();
  });

  it("ignores blank initial items and submits the remaining list", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <RoutineForm
        submitLabel="Update routine"
        initialItems={["Write", "   ", "Walk"]}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Update routine" }));

    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith(["Write", "Walk"]);
  });
});
