"use client";

import { PLATFORM_META, type Platform } from "@/lib/socialPlatforms";

export type PreviewLink = {
  id: string;
  title: string;
  url: string;
  emoji: string | null;
  kind: "LINK" | "SOCIAL";
  platform: Platform | null;
  active: boolean;
};

export type PreviewTheme = {
  backgroundColor: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
  buttonStyle: "rounded" | "square" | "pill";
  backgroundImage: string | null;
};

export default function ProfilePreview({
  username,
  bio,
  theme,
  links,
  showBranding = true,
}: {
  username: string;
  bio?: string | null;
  theme: PreviewTheme;
  links: PreviewLink[];
  showBranding?: boolean;
}) {
  const buttonRadius =
    theme.buttonStyle === "pill" ? "9999px" : theme.buttonStyle === "square" ? "4px" : "12px";

  const mainLinks = links.filter((l) => l.kind === "LINK" && l.active);
  const socialLinks = links.filter((l) => l.kind === "SOCIAL" && l.active);

  return (
    <div className="mx-auto w-64 sm:w-72">
      <div className="relative rounded-[2.5rem] border-4 border-slate-800 bg-slate-950 p-2 shadow-2xl">
        <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-950" />
        <div
          className="h-[520px] overflow-y-auto rounded-[2rem] px-5 pb-8 pt-10"
          style={{
            backgroundColor: theme.backgroundColor,
            backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : undefined,
            backgroundSize: "cover",
          }}
        >
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-lime-400 to-brand-600" />
            <p className="mt-3 text-sm font-semibold" style={{ color: theme.textColor }}>
              @{username || "yourname"}
            </p>
            {bio && (
              <p className="mt-1 text-center text-xs" style={{ color: theme.textColor }}>
                {bio}
              </p>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {socialLinks.map((link) => {
                const meta = link.platform ? PLATFORM_META[link.platform] : PLATFORM_META.other;
                const Icon = meta.Icon;
                return (
                  <div
                    key={link.id}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: theme.buttonColor, color: theme.buttonTextColor }}
                  >
                    <Icon size={16} />
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 space-y-2.5">
            {mainLinks.length === 0 && (
              <p className="text-center text-xs" style={{ color: theme.textColor, opacity: 0.6 }}>
                No links yet
              </p>
            )}
            {mainLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-center gap-2 py-3 text-center text-xs font-medium shadow-sm"
                style={{
                  backgroundColor: theme.buttonColor,
                  color: theme.buttonTextColor,
                  borderRadius: buttonRadius,
                }}
              >
                {link.emoji && <span>{link.emoji}</span>}
                <span className="truncate">{link.title}</span>
              </div>
            ))}
          </div>

          {showBranding && (
            <p
              className="mt-8 text-center text-[10px] font-medium"
              style={{ color: theme.textColor, opacity: 0.5 }}
            >
              🦆 Made with QuackLink
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
