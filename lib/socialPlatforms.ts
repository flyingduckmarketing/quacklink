import { Instagram, Twitter, Youtube, Music2, Facebook, Linkedin, Github, Mail, Globe, Link2 } from "lucide-react";

export const PLATFORM_META = {
  instagram: { label: "Instagram", Icon: Instagram },
  twitter: { label: "X / Twitter", Icon: Twitter },
  youtube: { label: "YouTube", Icon: Youtube },
  tiktok: { label: "TikTok", Icon: Music2 },
  facebook: { label: "Facebook", Icon: Facebook },
  linkedin: { label: "LinkedIn", Icon: Linkedin },
  github: { label: "GitHub", Icon: Github },
  email: { label: "Email", Icon: Mail },
  website: { label: "Website", Icon: Globe },
  other: { label: "Other", Icon: Link2 },
} as const;

export type Platform = keyof typeof PLATFORM_META;

export const PLATFORM_OPTIONS = Object.entries(PLATFORM_META).map(([value, meta]) => ({
  value: value as Platform,
  label: meta.label,
}));
