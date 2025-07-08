import React from 'react';

const Logo = () => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <div
        className="logo"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          className="max-w-28"
          src={isHovered ? "src/imgs/pinkSadia.png" : "src/imgs/darkSadia.png"}
          alt="Sadia.lux"
        />
      </div>
    );
};

export default Logo;