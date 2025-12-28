import React from "react";
import PropTypes from "prop-types";
import { Button } from "@material-tailwind/react";

const Hero = () => {
  return (
    <section className="relative w-screen h-screen  bg-transparent">
      {/* Main content */}
      <div className="container flex justify-center items-center  h-[80%] mx-auto px-4 py-32">
        <div className="flex flex-col items-center text-center pt-[20%] text-white z-10 relative">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to Sadia Lux
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            Your destination for luxury and elegance
          </p>
          <Button size="lg" color="white" className="mt-4">
            Explore Now
          </Button>
        </div>
      </div>

      {/* Triangle shape overlay */}
      <section className="relative  w-screen h-screen bg-transparent">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
             w-full max-w-[1400px] h-[400px]
             bg-white/25 backdrop-blur-xl "
          style={{
            clipPath: "polygon(0 30%, 100% 0, 100% 70%, 0 100%)",
            backgroundImage: `
      linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0.85)) 0 0 / 3px 100% no-repeat,
      linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0.85)) 100% 0 / 3px 100% no-repeat`,
          }}
        ></div>
      </section>
    </section>
  );
};

export default Hero;
