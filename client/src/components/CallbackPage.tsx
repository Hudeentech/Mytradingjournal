// src/pages/CallbackPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const username = params.get("username");

    if (token && username) {
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      navigate("/home");
        setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-800 text-lg font-semibold animate-pulse">
        Logging you in...
      </p>
    </div>
  );
};

export default CallbackPage;
