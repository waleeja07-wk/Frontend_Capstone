import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavBar } from "@/components/NavBar";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  ),
}));

describe("NavBar", () => {
  it("shows the Daybook name as a link home", () => {
    render(<NavBar />);

    expect(screen.getByRole("link", { name: "Daybook" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("links to every main section", () => {
    render(<NavBar />);

    const main = screen.getByRole("navigation", { name: "Main" });
    const expected = {
      Today: "/",
      Routine: "/routine",
      Patterns: "/patterns",
      History: "/history",
      Settings: "/settings",
    };

    for (const [label, href] of Object.entries(expected)) {
      expect(within(main).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    }
  });

  it("includes the mobile menu button, closed by default", () => {
    render(<NavBar />);

    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
