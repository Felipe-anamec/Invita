import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import type { ResolvedTheme } from "@/lib/theme";

type EventCardProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  theme: ResolvedTheme;
  flush?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

export function EventCard<T extends ElementType = "section">({
  as,
  children,
  theme: t,
  flush = false,
  style,
  ...props
}: EventCardProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      {...props}
      style={{
        background: "var(--paper)",
        border: "2px solid var(--ink)",
        borderRadius: "0px",
        padding: flush ? 0 : "24px",
        marginBottom: "16px",
        backdropFilter: "none",
        boxShadow: "3px 3px 0 var(--ink)",
        ...(flush ? { overflow: "hidden" } : {}),
        ...style,
      }}
    >
      {children}
    </Component>
  );
}
