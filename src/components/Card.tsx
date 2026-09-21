interface CardProps {
  imageUrl: string;
  title: string;
  tagline: string;
  onClick: () => void;
}

const Card = ({ imageUrl, title, tagline, onClick }: CardProps) => {
  return (
    <button
      type="button"
      className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-800 text-left shadow-lg shadow-black/20 outline-none transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-950/40 focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950 motion-reduce:transform-none motion-reduce:transition-none"
      onClick={onClick}
      aria-label={`View ${title}`}
    >
      <img
        src={imageUrl}
        alt=""
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
        loading="lazy"
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent px-4 pb-4 pt-12 text-white">
        <span className="block text-base font-semibold leading-tight">{title}</span>
        <span className="mt-1 block text-xs leading-snug text-slate-300">{tagline}</span>
      </span>
    </button>
  );
};

export default Card;
