import React from "react";
import { GithubIcon, Logo } from "./Icons";

interface HeroProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  isBgDark: boolean;
}

const Hero: React.FC<HeroProps> = ({ isBgDark }) => {
  const titleColor = isBgDark ? "text-gray-100" : "text-gray-900";
  const subtitleColor = isBgDark ? "text-gray-300" : "text-gray-600";
  const accentColor = isBgDark ? "text-indigo-400" : "text-indigo-600";
  const navIconColor = isBgDark
    ? "text-white/80 hover:text-white"
    : "text-gray-500 hover:text-gray-800";
  const navLogoColor = isBgDark ? "text-white" : "text-gray-800";

  return (
    <header className="relative w-full min-h-screen flex items-center justify-center text-center overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <a
            href="#"
            className={`flex items-center space-x-2 ${navLogoColor}`}
            aria-label="StyleScape Home"
          >
            <Logo />
            <span className="font-bold text-xl hidden sm:inline">
              StyleScape
            </span>
          </a>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/chandrakantdubey"
              target="_blank"
              rel="noopener noreferrer"
              className={navIconColor}
              aria-label="GitHub Repository"
            >
              <GithubIcon />
            </a>
          </div>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <h1
            className={`text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter drop-shadow-lg ${titleColor}`}
          >
            Instantly Modify
            <span className={`block ${accentColor}`}>Stunning Backgrounds</span>
          </h1>
          <p
            className={`mt-6 max-w-lg mx-auto text-lg drop-shadow-md ${subtitleColor}`}
          >
            Unlock over 800 unique, procedurally generated patterns. One-click
            copy for CSS and seamless integration into any project.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="#patterns"
              className="inline-block bg-indigo-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
            >
              Explore Library
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
