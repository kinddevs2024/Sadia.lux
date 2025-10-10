import React from "react";
import PropTypes from "prop-types";

const Hero = ({}) => {
  return (
    <>
      <section className=" *:h-screen  w-full ">
        <div className="relative flex flex-col text-center  items-center justify-center pt-20 pb-32 lg:pt-32 lg:pb-96">
          <div className="absolute text-center top-0 left-0 w-full h-full  justify-center items-center opacity-50 z-0"></div>
          <div className="relative mt-[45%]  z-10 max-w-3xl px-4 sm:px-6 lg:px-8">
            
          </div>
          <div className="absolute bottom-0 left-0 w-full h-32  z-0"></div>
        </div>
      </section>
    </>
  );
};

export default Hero;
