import React, { useState, useEffect } from "react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    // Function to determine theme based on time
    const getTimeBasedTheme = () => {
      const hour = new Date().getHours();
      return (hour >= 6 && hour < 18) ? "light" : "dark";
    };

    // Function to apply theme
    const applyTheme = (selectedTheme) => {
      let effectiveTheme = selectedTheme;
      
      if (selectedTheme === "system") {
        effectiveTheme = getTimeBasedTheme();
      }

      if (effectiveTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Initial theme application
    applyTheme(theme);

    // Set up interval to check time-based changes
    const intervalId = setInterval(() => {
      if (theme === "system") {
        applyTheme("system");
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const themeOrder = ["light", "dark", "system"];
    const currentIndex = themeOrder.indexOf(theme);
    const newTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
    setTheme(newTheme);
  };

  const getIconForTheme = () => {
    switch (theme) {
      case "dark":
        return (
          <div>
            <svg className="w-3 h-3 text-gray-800" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          </div>
        );
      case "system":
        return (
          <div>
            <svg className="w-3 h-3 text-gray-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 6h16v10H4V6zm18 4v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2h16a2 2 0 012 2z" />
            </svg>
          </div>
        );
      default: // light
        return (
          <div>
            <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 6a6 6 0 100 12 6 6 0 000-12zM4.24 19.16l1.42-1.42-1.79-1.8-1.41 1.41 1.78 1.81zM19.16 4.84l1.41-1.41-1.79-1.8-1.41 1.41 1.79 1.8z" />
            </svg>
          </div>
        );
    }
  };

  // Change background color to grey when dark theme is active
  useEffect(() => {
    document.body.style.backgroundColor = theme === "dark" ? "grey" : "";
  }, [theme]);

  return (
    <div className="relative flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 w-32 h-12 shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Animated background */}
      <div
        className={`absolute h-10 w-10 rounded-full transition-all duration-500 ease-in-out transform
          ${theme === 'light' ? 'translate-x-0 bg-yellow-200 shadow-yellow-300' : 
            theme === 'dark' ? 'translate-x-10 bg-gray-600 shadow-gray-700' : 
            'translate-x-20 bg-blue-200 shadow-blue-300'}
          shadow-lg scale-95 hover:scale-100`}
      />
      
      {/* Buttons */}
      <button
        onClick={() => setTheme('light')}
        className={`z-10 p-2 rounded-full transition-all duration-300
          ${theme === 'light' ? 'scale-110 bg-opacity-20 bg-yellow-100' : 'hover:bg-gray-300/50'}`}
        aria-label="Light theme"
      >
        <svg className="w-6 h-6 text-yellow-500 transform transition-transform hover:rotate-90" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 6a6 6 0 100 12 6 6 0 000-12zM4.24 19.16l1.42-1.42-1.79-1.8-1.41 1.41 1.78 1.81zM19.16 4.84l1.41-1.41-1.79-1.8-1.41 1.41 1.79 1.8z" />
        </svg>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`z-10 p-2 rounded-full transition-all duration-300
          ${theme === 'dark' ? 'scale-110 bg-opacity-20 bg-gray-700' : 'hover:bg-gray-300/50'}`}
        aria-label="Dark theme"
      >
        <svg className="w-6 h-6 text-gray-800 dark:text-gray-200 transform transition-transform hover:rotate-90" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`z-10 p-2 rounded-full transition-all duration-300
          ${theme === 'system' ? 'scale-110 bg-opacity-20 bg-blue-100' : 'hover:bg-gray-300/50'}`}
        aria-label="System theme"
      >
        <svg className="w-6 h-6 text-gray-600 transform transition-transform hover:rotate-90" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6h16v10H4V6zm18 4v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2h16a2 2 0 012 2z" />
        </svg>
      </button>
    </div>
  );
};

export default ThemeToggle;
