import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import landingImage from "../assets/landing.png"; // 👈 thay bằng ảnh minh hoạ bạn có

export default function LandingPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleGetStarted = () => {
    if (token) navigate("/dashboard");
    else navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 text-white flex flex-col">
      {/* 🔹 Nút Get Started góc phải trên */}
      <div className="flex justify-end p-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
          className="bg-yellow-400 text-indigo-900 px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-yellow-300 transition-all"
        >
          Get Started
        </motion.button>
      </div>

      {/* 🔹 Phần chính */}
      <main className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 flex-grow">
        {/* Bên trái: nội dung */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 space-y-6 text-center md:text-left"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Smart <span className="text-yellow-300">Expense</span> Tracker
          </h1>
          <p className="text-white/90 text-lg leading-relaxed">
            Theo dõi chi tiêu, quản lý tài chính cá nhân và đạt được mục tiêu tiết kiệm của bạn
            một cách dễ dàng. Hệ thống trực quan, tiện lợi và hoàn toàn bảo mật.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
            className="bg-white text-indigo-700 px-8 py-3 rounded-full font-bold shadow-xl hover:bg-yellow-300 hover:text-indigo-900 transition-all"
          >
            Get Started
          </motion.button>
        </motion.div>

        {/* Bên phải: hình minh họa */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 flex justify-center mt-10 md:mt-0"
        >
          <img
            src={landingImage}
            alt="landing illustration"
            className="w-full max-w-lg drop-shadow-2xl"
          />
        </motion.div>
      </main>
    </div>
  );
}
