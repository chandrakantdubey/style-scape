import React, { useEffect, useState, useMemo } from "react";
import { GithubIcon, Logo, SunIcon, MoonIcon } from "./Icons";
import { presets } from "../presets";
import { renderSVG } from "../render/svgRenderer";
import type { Preset } from "../state/types";

interface HeroProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const AnimatedPreview: React.FC<{ initialPreset: Preset }> = ({
  initialPreset,
}) => {
  const [preset, setPreset] = useState(initialPreset);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomPreset = presets[Math.floor(Math.random() * presets.length)];
      setPreset(randomPreset);
    }, Math.random() * 2000 + 2000); // Change every 2-4 seconds
    return () => clearInterval(interval);
  }, []);

  const svgString = useMemo(
    () =>
      renderSVG({
        canvas: preset.canvas,
        layers: preset.layers,
        selectedLayerId: null,
      }),
    [preset]
  );

  const svgDataUrl = useMemo(
    () => `url("data:image/svg+xml,${encodeURIComponent(svgString)}")`,
    [svgString]
  );

  return (
    <div
      className="w-full h-full rounded-lg shadow-inner transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: svgDataUrl,
        backgroundSize: "cover",
      }}
    />
  );
};

const Hero: React.FC<HeroProps> = ({ theme, onToggleTheme }) => {
  const previewPresets = useMemo(
    () =>
      Array.from(
        { length: 9 },
        () => presets[Math.floor(Math.random() * presets.length)]
      ),
    []
  );

  return (
    <header className="relative w-full overflow-hidden">
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <a
            href="#"
            className="flex items-center space-x-2 text-gray-800 dark:text-white"
            aria-label="Vivid Canvas Home"
          >
            <Logo />
            <span className="font-bold text-xl hidden sm:inline">
              Vivid Canvas
            </span>
          </a>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/google/aistudio-web"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
              aria-label="GitHub Repository"
            >
              <GithubIcon />
            </a>
            <button
              onClick={onToggleTheme}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
              aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
              } mode`}
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter text-gray-900 dark:text-gray-100 drop-shadow-lg">
            Stunning Backgrounds
            <span className="block text-indigo-600 dark:text-indigo-400">
              For Beautiful Websites
            </span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto md:mx-0 text-lg text-grey-600 dark:text-grey-300 drop-shadow-md">
            Unlock over 500 unique, procedurally generated patterns. One-click
            copy for CSS and seamless integration into any project.
          </p>

          <div className="mt-8 flex justify-center md:justify-start">
            <a
              href="#patterns"
              className="inline-block bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-orange-700 dark:hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
            >
              Explore Library
            </a>
          </div>
        </div>

        <div className="relative w-full aspect-square max-w-md mx-auto md:max-w-none">
          <div className="grid grid-cols-3 gap-3">
            {previewPresets.map((p, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg shadow-lg bg-gray-200 dark:bg-gray-800"
                style={{
                  animation: `fadeIn 0.5s ease-out ${i * 100}ms forwards`,
                  opacity: 0,
                }}
              >
                <AnimatedPreview initialPreset={p} />
              </div>
            ))}
          </div>
          <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
        </div>
      </div>
    </header>
  );
};

export default Hero;
