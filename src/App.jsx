import {} from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Loyaout from "./Layout/Loyaout";
import Home from "./pages/Home/Home";
import Aboute from "./pages/About/Aboute";
import { useState, useEffect } from "react";
import Eror from "./pages/Eror-404/Eror";
import Aos from "aos";
import Admin from "./pages/Admin/Admin";
import Dress from "./pages/Dress/Dress";
import Shit from "./pages/Shit/Shit";
import Aksusars from "./pages/Aksusars/Aksusars";

function App() {
  Aos.init();
  const [theme, setTheme] = useState(() => {
    const initialTheme = localStorage.getItem("theme");
    return initialTheme ? initialTheme : "light";
  });
  return (
    <>
      <Loyaout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/koylaklar" element={<Dress />} />
          <Route path="/Aksisuarlar" element={<Aksusars />} />
          <Route path="/Yupkalar" element={<Shit />} />
          <Route path="/Aboutus" element={<Aboute />} />
          <Route path="*" element={<Eror />} />
        </Routes>
      </Loyaout>
    </>
  );
}

export default App;
