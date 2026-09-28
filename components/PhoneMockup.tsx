import { Camera, Music2, Youtube, ShoppingBag, MessageCircle } from "lucide-react";

const FLOATING_ICONS = [
  { Icon: Camera, className: "-left-6 top-10 bg-lime-400 text-brand-950", delay: "0s" },
  { Icon: MessageCircle, className: "-left-4 top-1/2 bg-brand-900 text-white", delay: "0.4s" },
  { Icon: Youtube, className: "-right-6 top-16 bg-brand-700 text-white", delay: "0.2s" },
  { Icon: ShoppingBag, className: "-right-8 bottom-24 bg-lime-400 text-brand-950", delay: "0.6s" },
  { Icon: Music2, className: "-left-8 bottom-16 bg-brand-900 text-white", delay: "0.8s" },
];

export default function PhoneMockup() {
  return (
    <div className="relative mx-auto w-64 sm:w-72">
      {FLOATING_ICONS.map(({ Icon, className, delay }, i) => (
        <div
          key={i}
          className={`absolute z-10 hidden h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-black/30 sm:flex animate-float ${className}`}
          style={{ animationDelay: delay }}
        >
          <Icon size={20} />
        </div>
      ))}

      <div className="relative rounded-[2.5rem] border-4 border-slate-800 bg-slate-950 p-2 shadow-2xl shadow-brand-900/40">
        <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-950" />
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-brand-50 to-white px-5 pb-8 pt-10">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-lime-400 to-brand-600" />
            <p className="mt-3 text-sm font-semibold text-slate-900">@yourname</p>
            <p className="text-xs text-slate-500">Creator &amp; Designer ✨</p>
          </div>
          <div className="mt-6 space-y-2.5">
            {["🌐 My Website", "🎥 Latest Video", "🛍️ Shop My Picks", "📩 Newsletter"].map((label) => (
              <div
                key={label}
                className="rounded-xl bg-brand-900 py-3 text-center text-xs font-medium text-white shadow-sm"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
