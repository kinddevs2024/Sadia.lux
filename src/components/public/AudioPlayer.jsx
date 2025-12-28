import { useState, useEffect, useRef } from "react";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline";

// Простые функции для работы с cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const setCookie = (name, value, days = 365) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Проверяем cookies при загрузке
    const musicEnabled = getCookie("musicEnabled");
    const savedVolume = getCookie("musicVolume");

    if (musicEnabled === "true" && audioRef.current) {
      setIsPlaying(true);
      // Попытка автоматического воспроизведения (может потребоваться взаимодействие пользователя)
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Автовоспроизведение заблокировано:", error);
          setIsPlaying(false);
        });
      }
    }

    if (savedVolume !== null && audioRef.current) {
      const volume = parseFloat(savedVolume);
      audioRef.current.volume = volume;
      setIsMuted(volume === 0);
    } else if (audioRef.current) {
      // Установить громкость по умолчанию (50%)
      audioRef.current.volume = 0.5;
      setCookie("musicVolume", "0.5");
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // Зацикливание музыки
      audio.currentTime = 0;
      if (isPlaying) {
        audio.play().catch((error) => {
          console.log("Ошибка воспроизведения:", error);
        });
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setCookie("musicEnabled", "false");
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setCookie("musicEnabled", "true");
        })
        .catch((error) => {
          console.log("Ошибка воспроизведения:", error);
        });
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = 0.5;
      setIsMuted(false);
      setCookie("musicVolume", "0.5");
    } else {
      audio.volume = 0;
      setIsMuted(true);
      setCookie("musicVolume", "0");
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio.m4a" loop preload="auto" />
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={togglePlay}
          className="bg-primary/90 hover:bg-primary text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
          aria-label={isPlaying ? "Остановить музыку" : "Включить музыку"}
        >
          {isPlaying ? (
            <SpeakerWaveIcon className="w-6 h-6" />
          ) : (
            <SpeakerXMarkIcon className="w-6 h-6" />
          )}
        </button>
      </div>
    </>
  );
};

export default AudioPlayer;
