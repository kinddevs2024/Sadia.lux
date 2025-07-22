import React from "react";
import styled from "styled-components";
import dressData from "../data/Dress.json";
import { Link } from "react-router-dom";

const Dress = () => {
  const dresses = Array.from({ length: 5 });

  return (
    <div className="container w-full mx-auto gap-3 px-4 *:first-letter:capitalize mt-10">
      <h1 className="mb-2 text-3xl font-bold font-display m-5">
        koylaklar Varagi
      </h1>
      <StyledWrapper className="grid-cols-1 max-w-[90%] gap-5 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dressData.map((dress, idx) => (
          <Link to={`/card/${dress.id}`} key={idx}>
            <div className="card m-5" key={idx}>
              <img
                src={dress.img || "public/SadiaLogo_Circle.png"}
                alt={dress.image || ""}
              />
              <h2 className="text-center text-xl font-semibold mt-4">
                {dress.name || `Koylak ${idx + 1}`}
              </h2>
              <p className="text-center text-gray-600 mt-2">
                Narxi: {dress.prise || "100,000 UZS"}
              </p>
            </div>
          </Link>
        ))}
      </StyledWrapper>
    </div>
  );
};

const StyledWrapper = styled.div`
  .card {
    width: 270px;
    height: 500px;
    background: rgb(236, 236, 236);
    box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
      rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  }
`;

export default Dress;
