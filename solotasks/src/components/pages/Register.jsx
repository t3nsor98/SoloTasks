// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserPlus,
  FaExclamationTriangle,
  FaCheck,
} from "react-icons/fa";
import { registerUser } from "../../store/slices/authSlice";
import toast from "react-hot-toast";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 1;
    // Contains number
    if (/\d/.test(password)) strength += 1;
    // Contains special char
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password]);

  // Clear specific error when field changes
  useEffect(() => {
    if (formErrors.username && username) {
      setFormErrors((prev) => ({ ...prev, username: null }));
    }
  }, [username, formErrors.username]);

  useEffect(() => {
    if (formErrors.email && email) {
      setFormErrors((prev) => ({ ...prev, email: null }));
    }
  }, [email, formErrors.email]);

  useEffect(() => {
    if (formErrors.password && password) {
      setFormErrors((prev) => ({ ...prev, password: null }));
    }
  }, [password, formErrors.password]);

  useEffect(() => {
    if (formErrors.confirmPassword && confirmPassword) {
      setFormErrors((prev) => ({ ...prev, confirmPassword: null }));
    }
  }, [confirmPassword, formErrors.confirmPassword]);

  const validateForm = () => {
    const errors = {};

    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Show toast for the first error
      const firstError = Object.values(formErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setIsLoading(true);

    try {
      await dispatch(registerUser({ email, password, username })).unwrap();
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      // Handle specific Firebase errors
      if (typeof error === "string" && error.includes("email-already-in-use")) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Email is already in use",
        }));
        toast.error("Email is already in use");
      } else if (typeof error === "string" && error.includes("weak-password")) {
        setFormErrors((prev) => ({
          ...prev,
          password: "Password is too weak",
        }));
        toast.error("Password is too weak");
      } else {
        toast.error(error || "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            Join the Hunters
          </motion.h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Create your account to start tracking quests
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  variants={inputVariants}
                  whileFocus="focus"
                  animate="blur"
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={`appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border ${
                    formErrors.username
                      ? "border-red-500"
                      : "border-system-purple-700"
                  } bg-system-black text-white placeholder-gray-500 focus:outline-none focus:ring-system-purple-500 focus:border-system-purple-500 focus:z-10 sm:text-sm`}
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                />
              </div>
              <AnimatePresence>
                {formErrors.username && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-sm text-red-500 flex items-center"
                  >
                    <FaExclamationTriangle className="mr-1" />
                    {formErrors.username}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
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
                  className={`appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border ${
                    formErrors.email
                      ? "border-red-500"
                      : "border-system-purple-700"
                  } bg-system-black text-white placeholder-gray-500 focus:outline-none focus:ring-system-purple-500 focus:border-system-purple-500 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <AnimatePresence>
                {formErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-sm text-red-500 flex items-center"
                  >
                    <FaExclamationTriangle className="mr-1" />
                    {formErrors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
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
                  autoComplete="new-password"
                  required
                  className={`appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border ${
                    formErrors.password
                      ? "border-red-500"
                      : "border-system-purple-700"
                  } bg-system-black text-white placeholder-gray-500 focus:outline-none focus:ring-system-purple-500 focus:border-system-purple-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">
                      Password strength:
                    </span>
                    <span
                      className={`text-xs ${
                        passwordStrength === 0
                          ? "text-red-500"
                          : passwordStrength === 1
                          ? "text-orange-500"
                          : passwordStrength === 2
                          ? "text-yellow-500"
                          : passwordStrength === 3
                          ? "text-green-500"
                          : "text-green-400"
                      }`}
                    >
                      {passwordStrength === 0
                        ? "Very Weak"
                        : passwordStrength === 1
                        ? "Weak"
                        : passwordStrength === 2
                        ? "Medium"
                        : passwordStrength === 3
                        ? "Strong"
                        : "Very Strong"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        passwordStrength === 0
                          ? "bg-red-500 w-1/5"
                          : passwordStrength === 1
                          ? "bg-orange-500 w-2/5"
                          : passwordStrength === 2
                          ? "bg-yellow-500 w-3/5"
                          : passwordStrength === 3
                          ? "bg-green-500 w-4/5"
                          : "bg-green-400 w-full"
                      }`}
                    ></div>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {formErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-sm text-red-500 flex items-center"
                  >
                    <FaExclamationTriangle className="mr-1" />
                    {formErrors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  variants={inputVariants}
                  whileFocus="focus"
                  animate="blur"
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border ${
                    formErrors.confirmPassword
                      ? "border-red-500"
                      : "border-system-purple-700"
                  } bg-system-black text-white placeholder-gray-500 focus:outline-none focus:ring-system-purple-500 focus:border-system-purple-500 focus:z-10 sm:text-sm`}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {password &&
                  confirmPassword &&
                  password === confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FaCheck className="h-5 w-5 text-green-500" />
                    </div>
                  )}
              </div>
              <AnimatePresence>
                {formErrors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-sm text-red-500 flex items-center"
                  >
                    <FaExclamationTriangle className="mr-1" />
                    {formErrors.confirmPassword}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-system-purple-600 hover:bg-system-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-system-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FaUserPlus className="h-5 w-5 text-system-purple-300 group-hover:text-system-purple-200" />
              </span>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </motion.button>
          </div>
        </form>

        <div className="text-center">
          <p className="mt-2 text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-system-purple-300 hover:text-system-purple-200 transition-colors"
            >
              Sign In
            </Link>
          </p>

          <p className="mt-4 text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
