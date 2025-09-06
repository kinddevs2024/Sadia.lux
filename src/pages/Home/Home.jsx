import { useEffect, useState } from "react";

const Home = () => {
  const [videoSrc, setVideoSrc] = useState("");

  useEffect(() => {
    const checkScreen = () => {
      if (window.matchMedia("(max-width: 600px)").matches) {
        setVideoSrc("/0823(1).mp4");
      } else {
        setVideoSrc("/Sadia.mp4");
      }
    };

    // Run on mount
    checkScreen();

    window.addEventListener("resize", checkScreen);
    window.addEventListener("orientationchange", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
      window.removeEventListener("orientationchange", checkScreen);
    };
  }, []);

  if (!videoSrc) return null; // Prevent rendering before src is set

  return (
    <>
      <video className="h-full md:w-full" autoPlay muted loop>
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </>
  );
};

export default Home;
