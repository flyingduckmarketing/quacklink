"use client";

export default function ProfileLinkButton({
  id,
  title,
  url,
  emoji,
  style,
}: {
  id: string;
  title: string;
  url: string;
  emoji: string | null;
  style: React.CSSProperties;
}) {
  function handleClick() {
    fetch(`/api/click/${id}`, { method: "POST" }).catch(() => {});
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2 px-4 py-3 text-center text-sm font-medium shadow-sm transition hover:scale-[1.02]"
      style={style}
    >
      {emoji && <span>{emoji}</span>}
      <span>{title}</span>
    </a>
  );
}
