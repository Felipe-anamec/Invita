import type { Locale } from "@/i18n/config";
import LanguageSelector from "./LanguageSelector";
import ProfileDropdown, { type DropdownUser } from "@/components/ui/ProfileDropdown";
import Link from "next/link";

export function AppNavLogo({
  href = "/",
  leading,
  trailing,
  className = "",
}: {
  href?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`w-full border-b border-line bg-ground/90 backdrop-blur-md sticky top-0 z-50 ${className}`}
    >
      <div className="shell h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {leading}
          <Link
            href={href}
            className="flex items-center gap-2 text-ink no-underline group transition-transform active:scale-95"
          >
            <span className="w-3 h-3 bg-signal inline-block rounded-none transition-transform group-hover:rotate-45" />
            <span className="font-display text-2xl font-bold tracking-tight text-ink uppercase">
              Invita
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">{trailing}</div>
      </div>
    </header>
  );
}

export function AppTopNav({
  user,
  onLocaleChange,
  href,
}: {
  user: DropdownUser | null;
  onLocaleChange?: (locale: Locale) => Promise<void>;
  href?: string;
  variant?: "default" | "fixed" | "event-overlay";
}) {
  return (
    <AppNavLogo
      href={href ?? (user ? "/dashboard" : "/")}
      trailing={
        <div className="flex items-center gap-3">
          <LanguageSelector onLocaleChange={onLocaleChange} />
          {user ? (
            <ProfileDropdown user={user} />
          ) : (
            <Link
              href="/auth/sign-in"
              className="btn-invita btn-signal text-xs py-1.5 px-3 min-h-[2.25rem]"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      }
    />
  );
}

export function AppNavBack({ href, title }: { href: string; title: string }) {
  return (
    <header className="w-full border-b border-line bg-ground/90 backdrop-blur-md sticky top-0 z-50">
      <div className="shell h-16 flex items-center gap-4">
        <Link
          href={href}
          className="text-ink hover:text-signal text-xl transition-colors no-underline font-bold"
        >
          ←
        </Link>
        <h1 className="font-display text-lg font-bold tracking-tight text-ink uppercase">
          {title}
        </h1>
      </div>
    </header>
  );
}
