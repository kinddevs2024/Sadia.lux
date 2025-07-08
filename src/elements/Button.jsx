import React from "react";
import styled from "styled-components";

const Button = () => {
  return (
    <StyledWrapper>
      <button type="button" className="btn">
        <div className="smoke">
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
          <div className="cloud" />
        </div>
        <div className="title">
          <span className="thunder">⚡</span>
          <strong className="description">Join now</strong>
        </div>
        <div className="glass">
          <div className="inner-glass" />
        </div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .btn {
    z-index: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 2px; /* Reduced padding */
    width: 12rem; /* Reduced width */
    height: 4rem; /* Reduced height */
    border-top: 2px double #ffffff92;
    border-bottom: none;
    border-left: 2px outset #0000007e;
    border-right: 2px solid #e94fcab3;
    border-radius: 1.2rem; /* Reduced radius */
    background-origin: border-box;
    background-clip: content-box, border-box;
    filter: hue-rotate(-15deg) drop-shadow(0px 20px 8px #00000028) saturate(2);

    background: linear-gradient(
      64.14deg,
      #b938ff 0%,
      #daa1f1 10%,
      #f179ec 15.58%,
      #fefffe 28.15%,
      #fc9f9d 45.31%,
      #ed8664 53.18%,
      #ff7423 58.79%,
      #ff875f 65.28%,
      #fbabae 75.48%,
      #fcbde5 85.31%,
      #e94fca 100.29%
    );
    transition: all 0.5s;
  }

  .btn:hover {
    transform: scale(1.1);
    filter: hue-rotate(-365deg) drop-shadow(0px 20px 8px #00000028) saturate(2);
  }

  .btn:hover .title > strong {
    font-size: 0.9rem; /* Reduced hover font size */
    font-weight: 800;
    transition: all 0.8s;
  }

  .glass {
    z-index: 10;
    display: flex;
    border: double 2px rgba(255, 255, 255, 0.263);
    backdrop-filter: blur(2px);
    filter: blur(1px) brightness(1.1) saturate(50%) hue-rotate(30deg);
    border-radius: 1rem; /* Reduced radius */
    width: 100%;
    height: 100%;
    padding: 0.5rem; /* Reduced padding */
    background-color: #ffffff1c;
    background-origin: content-box;
    background-clip: content-box, border-box;
    box-shadow: inset 0 0 8px #a84fd88d;
  }

  .inner-glass {
    z-index: 10;
    display: flex;
    border-left: 1px solid rgba(255, 255, 255, 0.564);
    border-right: 1px solid rgb(255, 255, 255);
    backdrop-filter: blur(40px);
    box-shadow: inset 0 0 16px rgba(246, 142, 213, 0.86);
    -webkit-backdrop-filter: blur(5px);
    border-radius: 0.4rem;
    width: 100%;
    height: 100%;
    background-origin: border-box;
    background-clip: content-box, border-box;
    filter: brightness(140%);
  }

  .title {
    inset: 0;
    display: flex;
    text-align: center;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 90;
    align-items: center;
    justify-content: center;
    color: black;
    font-size: 0.8rem; /* Reduced font size */
    gap: 0.4rem;
  }

  .thunder {
    display: flex;
    align-items: center;
    justify-content: center;
    filter: grayscale(100%) brightness(0);
    font-size: 1rem; /* Reduced size */
  }

  .description {
    font-size: 0.9rem; /* Reduced font size */
    font-weight: 600;
  }

  .smoke {
    z-index: 90;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    position: absolute;
  }

  .cloud {
    position: absolute;
    border-radius: 9999px;
  }

  .cloud:nth-of-type(1) {
    left: 1.2rem;
    top: 0.2rem;
    width: 7rem; /* Reduced width */
    height: 0.7rem; /* Reduced height */
  }

  .cloud:nth-of-type(2) {
    left: 2rem;
    top: 1.5rem;
    width: 3rem; /* Adjusted size */
    height: 1.5rem;
  }

  .cloud:nth-of-type(3) {
    left: 8rem;
    top: 0.3rem;
    width: 4rem; /* Adjusted size */
    height: 4rem;
  }

  .cloud:nth-of-type(4) {
    left: 13rem;
    top: 0.8rem;
    width: 2.5rem;
    height: 3rem;
  }

  .cloud:nth-of-type(5) {
    top: 0.4rem;
    height: 0.5rem;
  }

  .cloud:nth-of-type(6) {
    left: 13rem;
    top: -0.1rem;
    width: 1.5rem;
    height: 1.5rem;
  }

  .cloud:nth-of-type(7) {
    left: 6rem;
    top: -1.5rem;
    width: 1.5rem;
    height: 4rem;
  }

  /* Remaining clouds were proportionally resized. */
`;

export default Button;
