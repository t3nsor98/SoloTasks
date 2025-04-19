// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaExclamationTriangle, FaHome, FaArrowLeft } from "react-icons/fa";

function NotFound() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-system-black to-system-gray p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-md w-full bg-system-gray p-8 rounded-lg shadow-system border border-system-purple-700 text-center"
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-6"
        >
          <FaExclamationTriangle className="text-6xl text-system-purple-400" />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-3xl font-bold text-system-purple-300 mb-4"
        >
          404 - Dungeon Not Found
        </motion.h1>

        <motion.p variants={itemVariants} className="text-gray-300 mb-8">
          The quest you're looking for doesn't exist or has been completed by
          another hunter.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center"
        >
          <Link
            to="/"
            className="flex items-center justify-center px-4 py-2 bg-system-purple-600 text-white rounded-md hover:bg-system-purple-700 transition-colors"
          >
            <FaHome className="mr-2" />
            Return to Base
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-4 py-2 border border-system-purple-700 text-system-purple-300 rounded-md hover:bg-system-black transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-8 p-4 bg-system-black rounded-lg border border-system-purple-700"
        >
          <p className="text-gray-400 text-sm">
            "Even the strongest hunters sometimes lose their way. The true test
            is finding your path again."
          </p>
          <p className="text-system-purple-300 text-sm mt-1">
            — System Message
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default NotFound;
