import React from "react";
import { Link, useParams } from "react-router-dom";
import data from "../pages/data/Dress.json";
import { Button } from "@material-tailwind/react";

const Card = ({ children }) => {
  const { id } = useParams();
  const card = data.find((item) => String(item.id) === String(id));

  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-gray-700 text-xl">
          Товар не найден
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen  flex items-center mt-16 mb-10 justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{card.name}</h1>
        <p className="text-lg text-gray-700">{card.info}</p>
        {card.img && (
          <img
            src={card.img}
            alt={card.name}
            className="w-full max-w-md mx-auto rounded-lg shadow"
          />
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Доступные размеры:
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {card.sizes &&
              card.sizes.map((sizeObj, idx) => (
                <li
                  key={idx}
                  className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex flex-col items-center"
                >
                  <span className="font-medium text-blue-900">
                    Размер: {sizeObj.size}
                  </span>
                  <span className="text-blue-700">
                    Количество: {sizeObj.number}
                  </span>
                </li>
              ))}
          </ul>
          <Link to={card.URL || "#"} className="w-full">
          <Button className="w-full mt-3">
            Купит ь за {card.prise || "100,000 UZS"}
          </Button>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Card;
