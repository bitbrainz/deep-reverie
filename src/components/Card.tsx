import React from "react";
interface CardProps {
  imageUrl: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ imageUrl, onClick }) => {
  return (
    <div
      className="border-gray-900 border-4 bg-cover bg-center transition-transform duration-300 ease-in-out transform hover:scale-110 shadow-lg hover:shadow-2xl"
      style={{ backgroundImage: `url(${imageUrl})`, paddingBottom: "100%" }}
      onClick={onClick}
    />
  );
};

export default Card;
