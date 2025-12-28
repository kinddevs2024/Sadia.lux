// ...existing code...
import React, { useEffect, useState } from "react";

/**
 * Customization bottom sheet + floating button (Tailwind CSS)
 * - No styled-components, uses Tailwind classes only
 * - Persists settings in localStorage
 */
export default function CustomizerButton() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("site-theme") || "light"
  );
  const [accent, setAccent] = useState(
    () => localStorage.getItem("site-accent") || "#06b6d4" // cyan-500
  );
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("site-font-size") || "16"
  );

  useEffect(() => {
    // theme: add/remove dark class on html
    const html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
    localStorage.setItem("site-theme", theme);
  }, [theme]);

  useEffect(() => {
    // accent: set CSS variable --accent
    document.documentElement.style.setProperty("--accent", accent);
    localStorage.setItem("site-accent", accent);
  }, [accent]);

  useEffect(() => {
    // font size in px
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem("site-font-size", fontSize);
  }, [fontSize]);

  const accents = [
    "#06b6d4", // cyan
    "#ef4444", // red
    "#f59e0b", // amber
    "#10b981", // emerald
    "#7c3aed", // violet
  ];

  return (
    <>
      {/* Floating toggle button */}
      <button
        aria-label="Open customizer"
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full shadow-lg
                   bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:scale-105 transition transform"
      >
        {/* gear icon */}
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
          <path strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
            d="M19.4 15a1.8 1.8 0 00.33 1.94l.06.06a1 1 0 01-1.41 1.41l-.06-.06a1.8 1.8 0 00-1.94-.33 1.8 1.8 0 00-1.05 1.64V20a1 1 0 01-2 0v-.43a1.8 1.8 0 00-1.05-1.64 1.8 1.8 0 00-1.94.33l-.06.06a1 1 0 01-1.41-1.41l.06-.06a1.8 1.8 0 00.33-1.94 1.8 1.8 0 00-1.64-1.05H4a1 1 0 010-2h.43a1.8 1.8 0 001.64-1.05 1.8 1.8 0 00-.33-1.94L5.68 6.7a1 1 0 011.41-1.41l.06.06a1.8 1.8 0 001.94.33h.01A1.8 1.8 0 0011 4.4V4a1 1 0 012 0v.43c.2.08.38.18.55.31.2.15.38.33.55.53.34.36.76.61 1.25.73.02 0 .05.01.07.01.01 0 .03 0 .04 0h.01a1.8 1.8 0 001.94-.33l.06-.06a1 1 0 011.41 1.41l-.06.06a1.8 1.8 0 00-.33 1.94c.12.49.38.9.73 1.25.2.17.38.35.53.55.13.17.23.36.31.56H20a1 1 0 010 2h-.43c-.08.2-.18.38-.31.55-.15.2-.33.38-.53.55-.49.36-.84.81-1.13 1.35z" />
        </svg>
      </button>

      {/* Bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 transform transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="mx-auto max-w-3xl rounded-t-xl bg-white dark:bg-gray-900 shadow-xl px-4 py-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Customize site</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); }}
                className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-sm"
              >
                {theme === "dark" ? "Dark" : "Light"}
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Accent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accent color</label>
              <div className="flex items-center gap-3">
                {accents.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccent(c)}
                    aria-label={`Set accent ${c}`}
                    className={`h-8 w-8 rounded-full border-2 ${accent === c ? "ring-2 ring-offset-2" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="h-8 w-8 p-0 bg-transparent border-none"
                  aria-label="Custom accent color"
                />
              </div>
            </div>

            {/* Font size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base font size</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="13"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full"
                />
                <div className="w-12 text-right text-sm text-gray-600 dark:text-gray-300">
                  {fontSize}px
                </div>
              </div>
            </div>

            {/* Reset */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  localStorage.removeItem("site-theme");
                  localStorage.removeItem("site-accent");
                  localStorage.removeItem("site-font-size");
                  setTheme("light");
                  setAccent("#06b6d4");
                  setFontSize("16");
                }}
                className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Reset
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Changes persist locally. Accent is set to CSS variable --accent for use in your site.
          </p>
        </div>
      </div>
    </>
  );
}
// ...existing code...