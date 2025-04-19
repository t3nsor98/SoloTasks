// src/components/ui/SystemNotification.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { clearNotification } from "../../store/slices/uiSlice";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaTrophy,
  FaExclamationCircle,
} from "react-icons/fa";

const SystemNotification = () => {
  const dispatch = useDispatch();
  const { notificationContent, notifications } = useSelector(
    (state) => state.ui
  );
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  // Progress bar animation
  useEffect(() => {
    if (!notificationContent || isPaused) return;

    const duration = notificationContent.duration || 3000;
    const interval = 10; // Update every 10ms for smooth animation
    const step = (interval / duration) * 100;

    let currentProgress = 100;
    const timer = setInterval(() => {
      currentProgress -= step;
      setProgress(Math.max(0, currentProgress));

      if (currentProgress <= 0) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [notificationContent, isPaused]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!notificationContent || isPaused) return;

    const timer = setTimeout(() => {
      dispatch(clearNotification());
    }, notificationContent.duration || 3000);

    return () => clearTimeout(timer);
  }, [notificationContent, dispatch, isPaused]);

  // Handle manual dismiss
  const handleDismiss = () => {
    dispatch(clearNotification());
  };

  // Get icon based on notification type
  const getNotificationIcon = () => {
    if (!notificationContent) return null;

    switch (notificationContent.type) {
      case "success":
        return <FaCheckCircle className="text-green-400 text-xl" />;
      case "warning":
        return <FaExclamationTriangle className="text-yellow-400 text-xl" />;
      case "error":
        return <FaExclamationCircle className="text-red-400 text-xl" />;
      case "achievement":
        return <FaTrophy className="text-yellow-400 text-xl" />;
      case "info":
      default:
        return <FaInfoCircle className="text-blue-400 text-xl" />;
    }
  };

  // Get border color based on notification type
  const getBorderColor = () => {
    if (!notificationContent) return "border-system-purple-500";

    switch (notificationContent.type) {
      case "success":
        return "border-green-500";
      case "warning":
        return "border-yellow-500";
      case "error":
        return "border-red-500";
      case "achievement":
        return "border-yellow-500";
      case "info":
      default:
        return "border-system-purple-500";
    }
  };

  // Get background glow based on notification type
  const getBackgroundGlow = () => {
    if (!notificationContent) return "";

    switch (notificationContent.type) {
      case "success":
        return "shadow-green-500/20";
      case "warning":
        return "shadow-yellow-500/20";
      case "error":
        return "shadow-red-500/20";
      case "achievement":
        return "shadow-yellow-500/30";
      case "info":
      default:
        return "shadow-system-purple-500/20";
    }
  };

  if (!notificationContent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed top-5 right-5 z-50 w-80"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className={`bg-system-gray border-2 ${getBorderColor()} rounded-lg shadow-lg ${getBackgroundGlow()} overflow-hidden`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="mr-3">{getNotificationIcon()}</div>
              <div className="flex-1">
                <h4 className="text-system-purple-300 font-bold text-base">
                  {notificationContent.title}
                </h4>
                <p className="text-white text-sm mt-1">
                  {notificationContent.message}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-system-black transition-colors"
                aria-label="Dismiss notification"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-system-black h-1">
            <motion.div
              className={`h-1 ${
                notificationContent.type === "success"
                  ? "bg-green-500"
                  : notificationContent.type === "warning"
                  ? "bg-yellow-500"
                  : notificationContent.type === "error"
                  ? "bg-red-500"
                  : notificationContent.type === "achievement"
                  ? "bg-yellow-500"
                  : "bg-system-purple-500"
              }`}
              style={{ width: `${progress}%` }}
              animate={{ width: isPaused ? `${progress}%` : "0%" }}
              transition={{
                duration: isPaused
                  ? 0
                  : (notificationContent.duration || 3000) / 1000,
                ease: "linear",
              }}
            />
          </div>

          {/* Notification count indicator (if multiple) */}
          {notifications && notifications.length > 1 && (
            <div className="absolute -top-2 -right-2 bg-system-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications.length}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SystemNotification;
