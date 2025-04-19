// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaSignInAlt, FaUserShield } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { setUser } from "../../store/slices/authSlice";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get user profile data
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let userData = { uid: user.uid, email: user.email };

      if (userDoc.exists()) {
        userData = {
          ...userData,
          username: userDoc.data().username,
          profileImageUrl: userDoc.data().profileImageUrl,
        };
      }

      dispatch(setUser(userData));

      // Apply remember me setting
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      // Handle specific error cases
      switch (error.code) {
        case "auth/user-not-found":
          setErrorMsg("No account found with this email address");
          toast.error("No account found with this email address");
          break;
        case "auth/wrong-password":
          setErrorMsg("Incorrect password");
          toast.error("Incorrect password");
          break;
        case "auth/too-many-requests":
          setErrorMsg("Too many failed login attempts. Please try again later");
          toast.error("Account temporarily locked. Try again later");
          break;
        case "auth/invalid-email":
          setErrorMsg("Invalid email address");
          toast.error("Invalid email address");
          break;
        default:
          setErrorMsg("Failed to sign in. Please try again.");
          toast.error("Login failed. Please try again");
      }
      console.error("Login error:", error.code, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Use your demo account credentials here
      const demoEmail = "demo@solotasks.com";
      const demoPassword = "demo123";

      const userCredential = await signInWithEmailAndPassword(
        auth,
        demoEmail,
        demoPassword
      );
      const user = userCredential.user;

      // Get user profile data
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let userData = { uid: user.uid, email: user.email };

      if (userDoc.exists()) {
        userData = {
          ...userData,
          username: userDoc.data().username,
          profileImageUrl: userDoc.data().profileImageUrl,
        };
      }

      dispatch(setUser(userData));
      toast.success("Logged in with demo account!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Demo login failed. Please try again");
      console.error("Demo login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email if available
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const inputVariants = {
    focus: { scale: 1.02, borderColor: "#6728ff" },
    blur: { scale: 1, borderColor: "#3d1899" },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-system-black to-system-gray py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={formVariants}
        className="max-w-md w-full space-y-8 bg-system-gray p-8 rounded-lg shadow-system border border-system-purple-700"
      >
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center text-3xl font-extrabold text-system-purple-300"
          >
            Sign in to SoloTasks
          </motion.h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-system-purple-300 hover:text-system-purple-200 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-900 bg-opacity-50 border border-red-700 text-white px-4 py-3 rounded-md"
          >
            <p>{errorMsg}</p>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  variants={inputVariants}
                  whileFocus="focus"
                  animate="blur"
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border border-system-purple-700 bg-system-black text-white placeholder-gray-500 focus:outline-none focus:ring-system-purple-500 focus:border-system-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  variants={inputVariants}
                  whileFocus="focus"
                  animate="blur"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border border-system-purple-700 bg-system-black text-white placeholder-gray-500 focus:outline-none focus:ring-system-purple-500 focus:border-system-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-system-purple-600 focus:ring-system-purple-500 border-gray-600 rounded bg-system-black"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-400"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() =>
                  toast.error("Password reset not implemented yet")
                }
                className="font-medium text-system-purple-300 hover:text-system-purple-200 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-system-purple-600 hover:bg-system-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-system-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FaSignInAlt className="h-5 w-5 text-system-purple-300 group-hover:text-system-purple-200" />
              </span>
              {isLoading ? "Signing in..." : "Sign in"}
            </motion.button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-700 w-full"></div>
              <div className="px-3 bg-system-gray text-gray-500 text-sm">
                OR
              </div>
              <div className="border-t border-gray-700 w-full"></div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-system-purple-700 text-sm font-medium rounded-md text-white bg-system-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-system-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FaUserShield className="h-5 w-5 text-system-purple-300 group-hover:text-system-purple-200" />
              </span>
              Try Demo Account
            </motion.button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
