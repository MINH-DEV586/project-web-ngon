import React, { useEffect, useState } from "react";

const DarkLight = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDark(true);
  }, []);

  return (
    <button onClick={() => setDark(!dark)} className="theme-toggle">
      {dark ? "🌞 Chuyển sang sáng" : "🌙 Chuyển sang tối"}
    </button>
  );
};

export default DarkLight;
