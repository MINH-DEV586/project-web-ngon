import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

const welcomeMessages: string[] = [
  "Chúc bạn quản lý chi tiêu hiệu quả!",
  "Sẵn sàng để theo dõi tài chính của bạn chưa?",
  "Hãy cùng kiểm soát ví tiền của mình nhé!",
  "Hôm nay bạn chi tiêu những gì? Hãy ghi lại nào!",
  "Tài chính trong tầm tay! Chào mừng trở lại.",
];

// Hàm helper để lấy tên người dùng từ localStorage
const getUserName = (): string => {
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      // Giả định 'user' là một chuỗi JSON chứa thuộc tính 'name' hoặc 'username'
      const user: { name?: string, username?: string } = JSON.parse(userString);
      return user.name || user.username || 'Người dùng'; 
    }
  } catch (error) {
    console.error("Lỗi khi phân tích cú pháp thông tin người dùng:", error);
  }
  return 'Người dùng';
};

// Hàm chọn ngẫu nhiên câu chào
const getRandomMessage = (): string => {
    const randomIndex: number = Math.floor(Math.random() * welcomeMessages.length);
    return welcomeMessages[randomIndex];
};


const Hello: React.FC = () => {
  useEffect(() => {
    // 1. Lấy tên người dùng
    const userName: string = getUserName();
    // 2. Chọn câu chào ngẫu nhiên
    const randomMessage: string = getRandomMessage();
    
    // 3. Hiển thị thông báo Toast
    toast.success(`Chào mừng trở lại, ${userName}! ${randomMessage}`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        
    });

  }, []); // Chỉ chạy một lần sau khi component được mount

  return <ToastContainer />;
};

export default Hello;