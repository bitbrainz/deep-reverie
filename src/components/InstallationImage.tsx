import { useState } from "react";

type InstallationImageProps = {
  className?: string;
  crop?: "standard" | "tight";
  priority?: boolean;
};

export const InstallationImage = ({
  className = "",
  crop = "standard",
  priority = false,
}: InstallationImageProps) => {
  const [unavailable, setUnavailable] = useState(false);

  return (
    <figure
      className={`relative m-0 overflow-hidden bg-violet-950/30 shadow-[0_30px_90px_rgba(76,29,149,0.28)] ${className}`}
    >
      {unavailable ? (
        <div
          role="status"
          className="grid aspect-[4/3] place-items-center border border-violet-300/20 px-8 text-center text-sm text-violet-100"
        >
          Installation photograph unavailable. The film and complete dream archive remain available below.
        </div>
      ) : (
        <img
          src="/images/deep-reverie-at-lumiere.webp"
          alt="Deep Reverie's vivid neon artwork glowing in a geometric outdoor frame at night"
          className={`h-full w-full object-cover transition-transform duration-700 motion-reduce:transition-none ${
            crop === "tight"
              ? "aspect-[4/3] origin-[74%_52%] scale-[1.85] object-[76%_48%] sm:aspect-[16/10] sm:scale-[1.7]"
              : "aspect-[4/3] object-[68%_center] sm:aspect-[3/2]"
          }`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setUnavailable(true)}
        />
      )}
      <figcaption className="flex items-center justify-between gap-6 border-t border-violet-200/15 bg-slate-950/95 px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-violet-200 sm:px-6">
        <span>Lumière: The Art of Light</span>
        <span className="text-slate-400">Toronto · 2025</span>
      </figcaption>
    </figure>
  );
};
