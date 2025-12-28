import React from "react";
import styled from "styled-components";

const Links = () => {
  return (
    <div className="fixed  right-4 top-2/4 hidden -translate-y-2/4 lg:block">
      <div className="relative border-white/40 backdrop-blur-lg text-white bg-white/20 bg-clip-border rounded-xl bg-white  shadow-md group flex flex-col gap-1 border border-blue-gray-50 p-1.5">
        <a href="https://www.instagram.com/sadia.lux?igsh=bGhuZWM2ZjZ0djZ4">
          <button
            className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm rounded-lg border border-white hover:opacity-75 focus:ring focus:ring-white/50 active:opacity-[0.85] flex w-full items-center gap-2 px-2 py-2 text-gray-600 hover:border hover:border-blue-gray-50 hover:text-primary"
            type="button"
          >
            <img
              width="48"
              height="48"
              src="https://img.icons8.com/fluency/48/instagram-new.png"
              alt="instagram-new"
            />
            <span className="mr-2    text-white hidden font-bold group-hover:block">
              Instagram
            </span>
          </button>
        </a>
        <a href="https://t.me/sadialux">
          <button
            className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm rounded-lg border border-white hover:opacity-75 focus:ring focus:ring-white/50 active:opacity-[0.85] flex w-full items-center gap-2 px-2 py-2 text-gray-600 hover:border hover:border-blue-gray-50 hover:text-primary"
            type="button"
          >
            <img
              width="48"
              height="48"
              src="https://img.icons8.com/fluency/48/telegram-app.png"
              alt="telegram-app"
            />
            <span className="mr-2  text-white hidden font-bold group-hover:block">
              Telegram
            </span>
          </button>
        </a>
        <a href="https://www.youtube.com/channel/UCZRjN6YnT07xdxDWvX07M6Q/">
          <button
            className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm rounded-lg border border-white hover:opacity-75 focus:ring focus:ring-white/50 active:opacity-[0.85] flex w-full items-center gap-2 px-2 py-2 text-gray-600 hover:border hover:border-blue-gray-50 hover:text-primary"
            type="button"
          >
            <img
              width="48"
              height="48"
              src="https://img.icons8.com/color/48/youtube-play.png"
              alt="youtube-play"
            />
            <span className="mr-2    text-white  hidden font-bold group-hover:block">
              Youtube
            </span>
          </button>
        </a>
      </div>
    </div>
  );
};


export default Links;
