import { useEffect } from "react";
import "./App.css";
import Aos from "aos";
import AppRoutes from "./router";
import ScrollToTop from "./components/shared/ScrollToTop";

function App() {
  useEffect(() => {
    Aos.init();
  }, []);

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}

export default App;
