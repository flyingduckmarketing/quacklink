import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { limitsFor } from "@/lib/plans";
import ProfileLinkButton from "@/components/ProfileLinkButton";
import SocialIconLink from "@/components/SocialIconLink";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    include: {
      theme: true,
      links: { where: { active: true }, orderBy: { order: "asc" } },
    },
  });

  if (!user) notFound();

  const limits = limitsFor(user.plan);
  const theme = user.theme;

  const backgroundColor = theme?.backgroundColor ?? "#f4f7f0";
  const buttonColor = theme?.buttonColor ?? "#123524";
  const buttonTextColor = theme?.buttonTextColor ?? "#ffffff";
  const textColor = theme?.textColor ?? "#0d2a1c";
  const buttonStyle = theme?.buttonStyle ?? "rounded";
  const backgroundImage = limits.backgroundImage ? theme?.backgroundImage : null;

  const buttonRadius = buttonStyle === "pill" ? "9999px" : buttonStyle === "square" ? "4px" : "12px";

  const mainLinks = user.links.filter((l) => l.kind === "LINK");
  const socialLinks = user.links.filter((l) => l.kind === "SOCIAL");

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-200">
          {user.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
          )}
        </div>
        <h1 className="mt-4 text-xl font-bold" style={{ color: textColor }}>
          @{user.username}
        </h1>
        {user.bio && (
          <p className="mt-1 text-center text-sm" style={{ color: textColor }}>
            {user.bio}
          </p>
        )}

        {socialLinks.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {socialLinks.map((link) => (
              <SocialIconLink
                key={link.id}
                id={link.id}
                url={link.url}
                platform={link.platform as any}
                style={{ backgroundColor: buttonColor, color: buttonTextColor }}
              />
            ))}
          </div>
        )}

        <div className="mt-8 w-full space-y-3">
          {mainLinks.map((link) => (
            <ProfileLinkButton
              key={link.id}
              id={link.id}
              title={link.title}
              url={link.url}
              emoji={link.emoji}
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
                borderRadius: buttonRadius,
              }}
            />
          ))}
        </div>

        {!limits.removeBranding && (
          <a
            href="/"
            className="mt-12 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm"
          >
            🦆 Made with QuackLink
          </a>
        )}
      </div>
    </main>
  );
}
