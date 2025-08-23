import React, { useState, useEffect } from "react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage or default to "light"
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    let newTheme = localStorage.getItem("theme") || "light";
    if (!localStorage.getItem("theme")) {
      if (hour >= 0 && hour < 6) {
        newTheme = "dark";
      } else {
        newTheme = "light";
      }
    }

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setTheme(newTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", newTheme);
      }}
      aria-label="Toggle theme"
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "4px",
        border: "1px solid #ccc",
        background: theme === "dark" ? "#222" : "#fff",
        color: theme === "dark" ? "#fff" : "#222", // This line ensures white text in dark mode
        cursor: "pointer",
      }}
    >
      {theme === "light" ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
};

export default ThemeToggle;
