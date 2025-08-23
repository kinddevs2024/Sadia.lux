import React from "react";

const Logo = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDark, setIsDark] = React.useState(() =>
    document.documentElement.classList.contains("dark")
  );

  React.useEffect(() => {
    const checkDark = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();

    // Listen for class changes on <html>
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  let imgSrc = "darkSadia.png";
  if (isHovered) {
    imgSrc = "pinkSadia.png";
  } else if (isDark) {
    imgSrc = "lightSadia.png";
  }

  return (
    <div
      className="logo"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img className="max-w-28" src={`/${imgSrc}`} alt="Sadia.lux" />
    </div>
  );
};

export default Logo;
