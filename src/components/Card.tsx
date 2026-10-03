import { MouseEventHandler } from "react";

interface CardProps {
  imageUrl: string;
  title: string;
  tagline: string;
  eager?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onPreload?: () => void;
}

const Card = ({
  imageUrl,
  title,
  tagline,
  eager = false,
  onClick,
  onPreload,
}: CardProps) => {
  return (
    <button
      type="button"
      className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-800 text-left shadow-lg shadow-black/20 outline-none transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-950/40 focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950 motion-reduce:transform-none motion-reduce:transition-none"
      onClick={onClick}
      onFocus={onPreload}
      onPointerDown={onPreload}
      onPointerEnter={onPreload}
      aria-label={`View ${title}`}
    >
      <img
        src={imageUrl}
        srcSet={`${imageUrl} 1x, ${imageUrl.replace("/thumbnails/", "/thumbnails-2x/")} 2x`}
        alt=""
        width="256"
        height="256"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent px-3 pb-3 pt-9 text-white sm:px-4 sm:pb-4 sm:pt-12">
        <span className="block text-sm font-semibold leading-tight sm:text-base">{title}</span>
        <span className="mt-1 hidden text-xs leading-snug text-slate-300 lg:block">{tagline}</span>
      </span>
    </button>
  );
};

export default Card;
