import { useEffect, useState } from "react";
import Dress from "../Dress/Dress";
import Hero from "./Hero";
import CustomizerButton from "./Button2";
import { Analytics } from '@vercel/analytics/react';
const Home = () => {
  const [videoSrc, setVideoSrc] = useState("");

  useEffect(() => {
    const checkScreen = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setVideoSrc("/Sadiabg.gif");
      } else {
        setVideoSrc("/Sadiat.gif");
      }
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    window.addEventListener("orientationchange", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
      window.removeEventListener("orientationchange", checkScreen);
    };
  }, []);

  if (!videoSrc) return null;

  return (
    <>
      <div className="mb-[80%] w-screen">
      <div className=""></div>
        <img
          src={videoSrc}
          alt="background"
          className="w-screen h-auto z-1000 mix-blend-lighten fixed"
          loading="lazy"
          decoding="async"
        />

        <div className="  flex justify-center ">
          <Hero />
        </div>
        <Dress />
      </div>
      <Analytics />
    </>
  );
};

export default Home;
