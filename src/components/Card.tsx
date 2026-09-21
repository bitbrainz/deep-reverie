import React from "react";
interface CardProps {
  imageUrl: string;
  imageAlt: string;
  eager?: boolean;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ imageUrl, imageAlt, eager, onClick }) => {
  return (
    <button
      type="button"
      className="block w-full aspect-square border-gray-900 border-4 overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-110 shadow-lg hover:shadow-2xl"
      onClick={onClick}
      aria-label={`View ${imageAlt}`}
    >
      <img
        src={imageUrl}
        alt={imageAlt}
        width="256"
        height="256"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </button>
  );
};

export default Card;
