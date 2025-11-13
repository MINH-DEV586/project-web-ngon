import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage"; // 👈 thêm dòng này
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("isDark") === "true";
  });

  useEffect(() => {
    localStorage.setItem("isDark", isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <Router>
      <Routes>
        {/* Trang landing - trang đầu tiên khi mở web */}
        <Route path="/" element={<LandingPage />} />

        {/* Đăng nhập */}
        <Route path="/login" element={<Login setToken={setToken} />} />

        {/* Đăng ký */}
        <Route path="/register" element={<Register />} />

        {/* Dashboard - chỉ vào khi có token */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard isDark={isDark} setIsDark={setIsDark} /> : <Navigate to="/login" replace />}
        />

        {/* Mặc định - nếu sai đường dẫn */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
