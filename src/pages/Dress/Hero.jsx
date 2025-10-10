import React from "react";
import PropTypes from "prop-types";

const Hero = ({}) => {
  return (
    <>
      <section className=" *:h-screen  w-full ">
        <div className="relative flex flex-col text-center  items-center justify-center pt-20 pb-32 lg:pt-32 lg:pb-96">
          <div className="absolute text-center top-0 left-0 w-full h-full  justify-center items-center opacity-50 z-0"></div>
          <div className="relative mt-[45%]  z-10 max-w-3xl px-4 sm:px-6 lg:px-8">
            <p className="mt-4 text-lg text-white sm:text-xl lg:text-2xl">
              VILLUR KO'YLAKLAR 
            </p>
            <div class="FhHeroFullBleed-style__CTAContainer-sc-fcb5fd34-6 hA-dRiU">
              <a
                class=" text-inherit underline LinkWrapper__StyledLink-sc-7fd343b3-0 ergpGe cta is-primary is-inversed fit-on-mobile-content with-theme-default"
                slot="anchor"
                data-testid="linkWrapper"
                href="/pl/en_gb/ca/women/handbags-c-women-handbags"
                tabindex="0"
                data-animate="true"
                title="Shop now"
                aria-label="Shop now"
              >
                Hozir buyurma bering
              </a>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-32  z-0"></div>
        </div>
      </section>
    </>
  );
};

export default Hero;
