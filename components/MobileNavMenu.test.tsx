import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MobileNavMenu } from "@/components/MobileNavMenu";

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

const links = [
  { href: "/", label: "Today" },
  { href: "/routine", label: "Routine" },
];

describe("MobileNavMenu", () => {
  it("keeps the menu closed until the button is pressed", () => {
    render(<MobileNavMenu links={links} />);

    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      screen.queryByRole("navigation", { name: "Mobile" }),
    ).not.toBeInTheDocument();
  });

  it("opens with a link for every destination", async () => {
    const user = userEvent.setup();
    render(<MobileNavMenu links={links} />);

    await user.click(screen.getByRole("button", { name: "Menu" }));

    const nav = screen.getByRole("navigation", { name: "Mobile" });
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(within(nav).getByRole("link", { name: "Today" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(nav).getByRole("link", { name: "Routine" })).toHaveAttribute(
      "href",
      "/routine",
    );
  });

  it("closes again when the button is pressed a second time", async () => {
    const user = userEvent.setup();
    render(<MobileNavMenu links={links} />);

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(screen.getByRole("button", { name: "Menu" }));

    expect(
      screen.queryByRole("navigation", { name: "Mobile" }),
    ).not.toBeInTheDocument();
  });

  it("closes after a destination is chosen", async () => {
    const user = userEvent.setup();
    render(<MobileNavMenu links={links} />);

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(screen.getByRole("link", { name: "Routine" }));

    expect(
      screen.queryByRole("navigation", { name: "Mobile" }),
    ).not.toBeInTheDocument();
  });
});
