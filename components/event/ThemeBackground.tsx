import type { ResolvedTheme } from "@/lib/theme";

// Invita redesign: the page background is handled via CSS variables (--ground, --paper, --ink).
// Dark-orb/blob decorations are suppressed so they don't bleed through the light stone theme.
export function ThemeBackground({ theme: _t }: { theme: ResolvedTheme }) {
  return null;
}
