import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFire,
  FaTrophy,
  FaTasks,
  FaStar,
  FaChartLine,
  FaCalendarAlt,
  FaUser,
  FaDungeon,
  FaChevronDown,
  FaChevronUp,
  FaMedal,
  FaInfoCircle,
} from "react-icons/fa";
import { getLevelProgress, getXpForNextLevel } from "../../utils/levelSystem";
import { Link } from "react-router-dom";

const StatsPanel = () => {
  const {
    level,
    xp,
    totalXp,
    streak,
    completedQuests,
    currentTitle,
    achievements,
  } = useSelector((state) => state.userStats);
  const { dailyQuests, weeklyQuests, customQuests, questChains } = useSelector(
    (state) => state.quests
  );
  const progress = getLevelProgress(xp, level);
  const xpNeeded = getXpForNextLevel(level);

  const [showAchievements, setShowAchievements] = useState(true);
  const [showMoreStats, setShowMoreStats] = useState(false);

  // Calculate active quests count
  const activeQuestsCount = [
    ...(dailyQuests || []),
    ...(weeklyQuests || []),
    ...(customQuests || []),
  ].filter((quest) => !quest.completed).length;

  // Calculate active dungeon runs count
  const activeDungeonCount = (questChains || []).filter(
    (quest) => !quest.completed
  ).length;

  // Get rank details
  const getRankDetails = () => {
    if (level < 10)
      return { rank: "E", title: "Beginner Hunter", color: "text-gray-400" };
    if (level < 20)
      return { rank: "D", title: "Novice Hunter", color: "text-green-400" };
    if (level < 30)
      return { rank: "C", title: "Skilled Hunter", color: "text-blue-400" };
    if (level < 40)
      return { rank: "B", title: "Elite Hunter", color: "text-purple-400" };
    if (level < 50)
      return { rank: "A", title: "Master Hunter", color: "text-yellow-400" };
    return { rank: "S", title: "Shadow Monarch", color: "text-red-400" };
  };

  const rankDetails = getRankDetails();

  // Calculate XP per day (average)
  const xpPerDay =
    completedQuests > 0 ? Math.round(totalXp / Math.max(1, streak)) : 0;

  // Calculate estimated time to next level
  const daysToNextLevel =
    xpPerDay > 0 ? Math.ceil((xpNeeded - xp) / xpPerDay) : "∞";

  // Get recent achievements (last 3)
  const recentAchievements = achievements ? achievements.slice(0, 3) : [];

  // Format achievement name
  const formatAchievementName = (id) => {
    switch (id) {
      case "first_quest":
        return { name: "First Quest", icon: "🏆" };
      case "streak_7":
        return { name: "Weekly Warrior", icon: "🔥" };
      case "quest_master":
        return { name: "Quest Master", icon: "⚔️" };
      case "dungeon_clearer":
        return { name: "Dungeon Clearer", icon: "🏰" };
      default:
        return { name: "Achievement Unlocked", icon: "🎯" };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-system-gray p-4 rounded-lg shadow-system sticky top-4"
    >
      <h2 className="text-xl font-bold text-system-purple-300 mb-4 border-b border-system-purple-700 pb-2 flex items-center">
        <FaUser className="mr-2" />
        Hunter Stats
      </h2>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-white font-medium">Level {level}</span>
          <span className="text-sm text-gray-400">
            {xp}/{xpNeeded} XP
          </span>
        </div>
        <div className="bg-gray-700 h-2.5 rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-system-purple-500 h-2.5 rounded-full"
          ></motion.div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="text-sm text-system-purple-300">{currentTitle}</div>
          <div className="text-xs text-gray-400">
            {xpNeeded - xp} XP to Level {level + 1}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-system-black border border-system-purple-700 rounded-lg p-3 hover:shadow-system transition-shadow duration-300"
        >
          <div className="flex items-center text-system-purple-300 mb-1">
            <FaTrophy className="mr-2" />
            <span className="text-sm">Total XP</span>
          </div>
          <div className="text-xl font-bold">{totalXp}</div>
          <div className="text-xs text-gray-500 mt-1">~{xpPerDay} XP/day</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-system-black border border-system-purple-700 rounded-lg p-3 hover:shadow-system transition-shadow duration-300"
        >
          <div className="flex items-center text-system-purple-300 mb-1">
            <FaFire className="mr-2" />
            <span className="text-sm">Streak</span>
          </div>
          <div className="text-xl font-bold">{streak} days</div>
          <div className="text-xs text-gray-500 mt-1">Keep it going!</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-system-black border border-system-purple-700 rounded-lg p-3 hover:shadow-system transition-shadow duration-300"
        >
          <div className="flex items-center text-system-purple-300 mb-1">
            <FaTasks className="mr-2" />
            <span className="text-sm">Quests</span>
          </div>
          <div className="text-xl font-bold">{completedQuests}</div>
          <div className="text-xs text-gray-500 mt-1">
            {activeQuestsCount} active
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-system-black border border-system-purple-700 rounded-lg p-3 hover:shadow-system transition-shadow duration-300"
        >
          <div className="flex items-center text-system-purple-300 mb-1">
            <FaStar className="mr-2" />
            <span className="text-sm">Rank</span>
          </div>
          <div className={`text-xl font-bold ${rankDetails.color}`}>
            {rankDetails.rank}
          </div>
          <div className="text-xs text-gray-500 mt-1">{rankDetails.title}</div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showMoreStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-system-black border border-system-purple-700 rounded-lg p-3">
                <div className="flex items-center text-system-purple-300 mb-1">
                  <FaChartLine className="mr-2" />
                  <span className="text-sm">Next Level</span>
                </div>
                <div className="text-lg font-bold">~{daysToNextLevel} days</div>
              </div>

              <div className="bg-system-black border border-system-purple-700 rounded-lg p-3">
                <div className="flex items-center text-system-purple-300 mb-1">
                  <FaDungeon className="mr-2" />
                  <span className="text-sm">Dungeons</span>
                </div>
                <div className="text-lg font-bold">{activeDungeonCount}</div>
              </div>
            </div>

            <div className="bg-system-black border border-system-purple-700 rounded-lg p-3">
              <div className="flex items-center text-system-purple-300 mb-2">
                <FaCalendarAlt className="mr-2" />
                <span className="text-sm">Activity Summary</span>
              </div>
              <div className="flex justify-between text-xs">
                <div className="text-center">
                  <div className="text-gray-400">Daily</div>
                  <div className="text-white text-lg font-bold">
                    {dailyQuests?.filter((q) => !q.completed).length || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Weekly</div>
                  <div className="text-white text-lg font-bold">
                    {weeklyQuests?.filter((q) => !q.completed).length || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Custom</div>
                  <div className="text-white text-lg font-bold">
                    {customQuests?.filter((q) => !q.completed).length || 0}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4">
        <button
          onClick={() => setShowMoreStats(!showMoreStats)}
          className="w-full text-center text-system-purple-300 hover:text-system-purple-200 text-sm flex items-center justify-center"
        >
          {showMoreStats ? (
            <>
              <FaChevronUp className="mr-1" /> Hide Details
            </>
          ) : (
            <>
              <FaChevronDown className="mr-1" /> Show More Stats
            </>
          )}
        </button>
      </div>

      <div className="border-t border-system-purple-700 pt-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-system-purple-300 font-semibold flex items-center">
            <FaMedal className="mr-2" />
            Achievements
          </h3>
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="text-gray-400 hover:text-white"
          >
            {showAchievements ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>

        <AnimatePresence>
          {showAchievements && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {recentAchievements.length > 0 ? (
                <div className="space-y-2">
                  {recentAchievements.map((achievementId, index) => {
                    const achievement = formatAchievementName(achievementId);
                    return (
                      <div
                        key={index}
                        className="bg-system-black p-2 rounded-lg border border-system-purple-700 flex items-center"
                      >
                        <div className="text-xl mr-2">{achievement.icon}</div>
                        <div className="text-sm text-white">
                          {achievement.name}
                        </div>
                      </div>
                    );
                  })}
                  <Link
                    to="/achievements"
                    className="block text-center text-sm text-system-purple-300 hover:text-system-purple-200 mt-2 py-1"
                  >
                    View All Achievements
                  </Link>
                </div>
              ) : (
                <div className="bg-system-black p-3 rounded-lg border border-system-purple-700 text-center">
                  <FaInfoCircle className="text-system-purple-400 text-lg mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    Complete quests to earn achievements!
                  </p>
                  <Link
                    to="/achievements"
                    className="block text-center text-sm text-system-purple-300 hover:text-system-purple-200 mt-2"
                  >
                    View Available Achievements
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-3 border-t border-system-purple-700">
        <div className="flex justify-center space-x-3">
          <Link
            to="/profile"
            className="flex items-center px-3 py-2 bg-system-black border border-system-purple-700 rounded-md text-system-purple-300 hover:bg-system-purple-900 transition-colors"
          >
            <FaUser className="mr-2" />
            Profile
          </Link>
          <Link
            to="/quest-chains"
            className="flex items-center px-3 py-2 bg-system-black border border-system-purple-700 rounded-md text-system-purple-300 hover:bg-system-purple-900 transition-colors"
          >
            <FaDungeon className="mr-2" />
            Dungeons
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsPanel;
