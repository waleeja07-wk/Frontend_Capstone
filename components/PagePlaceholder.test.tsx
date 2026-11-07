import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PagePlaceholder } from "@/components/PagePlaceholder";

describe("PagePlaceholder", () => {
  it("renders the title as a heading with a default description", () => {
    render(<PagePlaceholder title="Health" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Health" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Coming soon/)).toBeInTheDocument();
  });

  it("uses a custom description when one is given", () => {
    render(<PagePlaceholder title="Health" description="Checking data." />);

    expect(screen.getByText("Checking data.")).toBeInTheDocument();
    expect(screen.queryByText(/Coming soon/)).not.toBeInTheDocument();
  });
});
