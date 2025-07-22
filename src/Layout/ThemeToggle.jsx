import React, { useState, useEffect } from "react";
 
const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    let newTheme = "light";
    if (hour >= 0 && hour < 6) {
      newTheme = "dark";
    } else if (hour >= 21) {
      newTheme = "light";
    } else {
      newTheme = "light";
    }

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setTheme(newTheme);
  }, []);
  return (
    <></>
  );
};
 
export default ThemeToggle;