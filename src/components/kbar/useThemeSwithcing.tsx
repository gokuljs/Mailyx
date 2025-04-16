/* eslint-disable react-hooks/exhaustive-deps */
import { useTheme } from "next-themes";
import { useRegisterActions } from "kbar";
import { useEffect, useCallback } from "react";

const useThemeSwitching = () => {
  const { theme, setTheme } = useTheme();

  // Define toggleTheme as a memoized callback
  // Only need theme in dependencies since setTheme has a stable reference
  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme]); // Only theme is needed here

  const themeAction = [
    {
      id: "toggleTheme",
      name: "Toggle Theme",
      shortcut: ["ctrl", "t"],
      section: "Theme",
      perform: toggleTheme,
    },
    {
      id: "setLightTheme",
      name: "Set Light Theme",
      section: "Theme",
      perform: () => setTheme("light"),
    },
    {
      id: "setDarkTheme",
      name: "Set Dark Theme",
      section: "Theme",
      perform: () => setTheme("dark"),
    },
  ];

  useRegisterActions(themeAction, [theme, toggleTheme]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "t") {
        event.preventDefault(); // Prevent new tab
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTheme]);

  return null;
};

export default useThemeSwitching;
