// src/components/ui/SystemNotification.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { clearNotification } from "../../store/slices/uiSlice";

const SystemNotification = () => {
  const dispatch = useDispatch();
  const { notificationContent } = useSelector((state) => state.ui);

  useEffect(() => {
    if (notificationContent) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, notificationContent.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [notificationContent, dispatch]);

  if (!notificationContent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-5 right-5 z-50 w-80"
      >
        <div className="bg-system-gray border-2 border-system-purple-500 rounded-lg shadow-system p-4">
          <div className="flex items-center">
            <div className="w-2 h-10 bg-system-purple-500 mr-3"></div>
            <div>
              <h4 className="text-system-purple-300 font-bold">
                {notificationContent.title}
              </h4>
              <p className="text-white">{notificationContent.message}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SystemNotification;
