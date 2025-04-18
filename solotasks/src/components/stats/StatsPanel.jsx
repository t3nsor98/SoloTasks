import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaFire, FaTrophy, FaTasks, FaStar } from "react-icons/fa";
import { getLevelProgress, getXpForNextLevel } from "../../utils/levelSystem";

const StatsPanel = () => {
  const { level, xp, totalXp, streak, completedQuests, currentTitle } =
    useSelector((state) => state.userStats);
  const progress = getLevelProgress(xp, level);
  const xpNeeded = getXpForNextLevel(level);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-system-gray p-4 rounded-lg shadow-system sticky top-4"
    >
      <h2 className="text-xl font-bold text-system-purple-300 mb-4 border-b border-system-purple-700 pb-2">
        Hunter Stats
      </h2>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-white">Level {level}</span>
          <span className="text-sm text-gray-400">
            {xp}/{xpNeeded} XP
          </span>
        </div>
        <div className="bg-gray-700 h-2 rounded-full">
          <div
            className="bg-system-purple-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-sm text-system-purple-300 mt-1">
          {currentTitle}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-system-gray border border-system-purple-700 rounded p-3">
          <div className="flex items-center text-system-purple-300 mb-1">
            <FaTrophy className="mr-2" />
            <span className="text-sm">Total XP</span>
          </div>
          <div className="text-xl font-bold">{totalXp}</div>
        </div>

        <div className="bg-system-gray border border-system-purple-700 rounded p-3">
          <div className="flex items-center text-system-purple-300 mb-1">
            <FaFire className="mr-2" />
            <span className="text-sm">Streak</span>
          </div>
          <div className="text-xl font-bold">{streak} days</div>
        </div>

        <div className="bg-system-gray border border-system-purple-700 rounded p-3">
          <div className="flex items-center text-system-purple-300 mb-1">
            <FaTasks className="mr-2" />
            <span className="text-sm">Quests</span>
          </div>
          <div className="text-xl font-bold">{completedQuests}</div>
        </div>

        <div className="bg-system-gray border border-system-purple-700 rounded p-3">
          <div className="flex items-center text-system-purple-300 mb-1">
            <FaStar className="mr-2" />
            <span className="text-sm">Rank</span>
          </div>
          <div className="text-xl font-bold">
            {level < 10
              ? "E"
              : level < 20
              ? "D"
              : level < 30
              ? "C"
              : level < 40
              ? "B"
              : level < 50
              ? "A"
              : "S"}
          </div>
        </div>
      </div>

      <div className="border-t border-system-purple-700 pt-3">
        <h3 className="text-system-purple-300 font-semibold mb-2">
          Recent Achievements
        </h3>
        {/* Display recent achievements here */}
      </div>
    </motion.div>
  );
};

export default StatsPanel;
