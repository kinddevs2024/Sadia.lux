import React from "react";
import {
  Navbar,
  Collapse,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Logo from "./Logo";
import Button from "../elements/Button";
import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function NavList() {
  return (
    <ul className="my-2 pt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
      >
        <NavLink
          to={"koylaklar"}
          className="flex items-center hover:text-sadia_light duration-200 transition-colors"
        >
          Ko'ylaklar
        </NavLink>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
      >
        <NavLink
          to={"Yupkalar"}
          className="flex items-center hover:text-sadia_light duration-200 transition-colors"
        >
          Yupkalar
        </NavLink>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
      >
        <NavLink
          to={"Aksisuarlar"}
          className="flex items-center hover:text-sadia_light duration-200 transition-colors"
        >
          Aksisuarlar
        </NavLink>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
      >
        <NavLink
          to={"Aboutus"}
          className="flex items-center hover:text-sadia_light duration-200 transition-colors"
        >
          Biz Haqimizda
        </NavLink>
      </Typography>
    </ul>
  );
}

export function Header() {
  const [openNav, setOpenNav] = React.useState(false);

  const handleWindowResize = () =>
    window.innerWidth >= 960 && setOpenNav(false);

  React.useEffect(() => {
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return (
    <Navbar className="mx-auto mt-1 max-w-screen-xl px-6 py-3">
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography
          as="a"
          href="/"
          variant="h6"
          className="mr-4 cursor-pointer py-1.5"
        >
          <Logo />
        </Typography>
        <div className="hidden lg:block">
          <NavList />
        </div>
        <IconButton
          variant="text"
          className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          ripple={false}
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        <NavList />
          <div className="relative  group flex flex-row gap-1 ">
            <a href="https://www.instagram.com/sadia.lux?igsh=bGhuZWM2ZjZ0djZ4">
              <button
                className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm rounded-lg border border-white hover:opacity-75 focus:ring focus:ring-white/50 active:opacity-[0.85] flex w-full items-center gap-2 px-2 py-2 text-gray-600 hover:border hover:border-blue-gray-50 hover:text-primary"
                type="button"
              >
                <img
                  width="48"
                  height="48"
                  src="https://img.icons8.com/fluency/48/instagram-new.png"
                  alt="instagram-new"
                />
                <span className="mr-2 hidden font-bold group-hover:block">
                  Instagram
                </span>
              </button>
            </a>
            <a href="https://t.me/sadialux">
              <button
                className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm rounded-lg border border-white hover:opacity-75 focus:ring focus:ring-white/50 active:opacity-[0.85] flex w-full items-center gap-2 px-2 py-2 text-gray-600 hover:border hover:border-blue-gray-50 hover:text-primary"
                type="button"
              >
                <img
                  width="48"
                  height="48"
                  src="https://img.icons8.com/fluency/48/telegram-app.png"
                  alt="telegram-app"
                />
                <span className="mr-2 hidden font-bold group-hover:block">
                  Telegram
                </span>
              </button>
            </a>
            <a href="https://www.youtube.com/channel/UCZRjN6YnT07xdxDWvX07M6Q/">
              <button
                className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm rounded-lg border border-white hover:opacity-75 focus:ring focus:ring-white/50 active:opacity-[0.85] flex w-full items-center gap-2 px-2 py-2 text-gray-600 hover:border hover:border-blue-gray-50 hover:text-primary"
                type="button"
              >
                <img
                  width="48"
                  height="48"
                  src="https://img.icons8.com/color/48/youtube-play.png"
                  alt="youtube-play"
                />
                <span className="mr-2 hidden font-bold group-hover:block">
                  Youtube
                </span>
              </button>
            </a>
          </div>
      </Collapse>
    </Navbar>
  );
}

export default Header;
