import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

function getStartingTheme() {
  const savedTheme = localStorage.getItem("chatter-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStartingTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("chatter-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}