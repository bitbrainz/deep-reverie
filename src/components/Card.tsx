import { MouseEventHandler } from "react";

interface CardProps {
  imageUrl: string;
  title: string;
  eager?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onPreload?: () => void;
}

const Card = ({
  imageUrl,
  title,
  eager = false,
  onClick,
  onPreload,
}: CardProps) => {
  return (
    <button
      type="button"
      className="group w-full text-left outline-none transition duration-300 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
      onClick={onClick}
      onFocus={onPreload}
      onPointerDown={onPreload}
      onPointerEnter={onPreload}
      aria-label={`View ${title}`}
    >
      <span className="block aspect-square overflow-hidden rounded-2xl bg-slate-800 shadow-lg shadow-black/20 transition duration-300 group-hover:shadow-2xl group-hover:shadow-violet-950/40 group-focus-visible:ring-2 group-focus-visible:ring-violet-300 group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-slate-950 motion-reduce:transition-none">
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
      </span>
      <span className="mt-2 block px-0.5 text-xs font-medium leading-snug text-slate-300">
        {title}
      </span>
    </button>
  );
};

export default Card;
