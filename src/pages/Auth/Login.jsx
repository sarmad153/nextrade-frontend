import React from "react";
import { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShoppingBasket,
} from "react-icons/fa";
import MainLogo from "../../assets/White Logo.png";
import { Link } from "react-router-dom";
import API from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const res = await API.post("/auth/login", {
        email: email.trim(),
        password: password,
      });

      if (res.data?.token) {
        login(res.data.user, res.data.token);
      } else {
        toast.error(res.data?.message || "Login failed - no token received");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          toast.error(
            err.response.data?.message || "Invalid email or password"
          );
        } else if (err.response.status === 403) {
          toast.error("Your account has been blocked. Please contact admin.");
        } else if (err.response.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(
            err.response.data?.message ||
              `Login failed (${err.response.status})`
          );
        }
      } else if (err.request) {
        toast.error(
          "Cannot connect to server. Please check if backend is running."
        );
      } else {
        toast.error("Login failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background-light font-inter">
      <div className="w-full overflow-hidden bg-white shadow-xl max-w-fit rounded-xl">
        <div className="p-6 text-center bg-primary-700">
          <div className="flex items-center justify-center mb-2">
            <img src={MainLogo} alt="NexTrade Logo" className="h-10 mr-2" />
            <h1 className="text-xl font-bold text-white">NexTrade</h1>
          </div>
          <p className="text-sm text-secondary-200">
            Digital Marketplace for Wholesale Trading
          </p>
        </div>

        <div className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-center text-neutral-800">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <label
                className="block mb-2 text-sm font-medium text-neutral-700"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaUser className="text-neutral-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="w-full py-3 pl-10 pr-3 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label
                className="block mb-2 text-sm font-medium text-neutral-700"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaLock className="text-neutral-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full py-3 pl-10 pr-10 border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-neutral-400 hover:text-neutral-600" />
                  ) : (
                    <FaEye className="text-neutral-400 hover:text-neutral-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded text-primary-600 border-neutral-300 focus:ring-primary-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label
                  htmlFor="remember-me"
                  className="block ml-2 text-sm text-neutral-700"
                >
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 font-bold text-white transition duration-300 rounded-lg bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm text-neutral-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-background-subtle">
          <p className="text-xs text-center text-neutral-500">
            © 2025 NexTrade - Faculty of Computer Science, University of South
            Asia
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
