"use client";

import { PLATFORM_META, type Platform } from "@/lib/socialPlatforms";

export default function SocialIconLink({
  id,
  url,
  platform,
  style,
}: {
  id: string;
  url: string;
  platform: Platform | null;
  style: React.CSSProperties;
}) {
  const meta = platform ? PLATFORM_META[platform] : PLATFORM_META.other;
  const Icon = meta.Icon;

  function handleClick() {
    fetch(`/api/click/${id}`, { method: "POST" }).catch(() => {});
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      aria-label={meta.label}
      className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition hover:scale-105"
      style={style}
    >
      <Icon size={18} />
    </a>
  );
}
