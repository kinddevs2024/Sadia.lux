import React from "react";
import {} from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Links from "./Links";
// import Card from "../elements/Card";

const Loyaout = ({ children }) => {
  return (
    <>
      <div className="bg-white dark:bg-gray-900 duration-300 text-black dark:text-white">
        <Header />
        {/* <Card /> */}
        {children}
        <Links />
        <Footer />
      </div>
    </>
  );
};

export default Loyaout;
