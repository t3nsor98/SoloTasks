// src/pages/Achievements.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy, FaLock, FaCheck, FaSearch, FaSort } from "react-icons/fa";
import { fetchUserStats } from "../../store/slices/userStatsSlice";
import { ACHIEVEMENTS } from "../../services/achievementsService";
import toast from "react-hot-toast";

const Achievements = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { achievements, isLoading, error } = useSelector(
    (state) => state.userStats
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default"); // default, locked, unlocked

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserStats(user.uid))
        .unwrap()
        .catch((err) => {
          toast.error("Failed to load achievements");
          console.error("Error fetching user stats:", err);
        });
    }
  }, [dispatch, user]);

  // Convert achievements object to array
  const achievementsArray = Object.values(ACHIEVEMENTS);

  // Filter and sort achievements
  const filteredAchievements = achievementsArray
    .filter(
      (achievement) =>
        achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aUnlocked = achievements && achievements.includes(a.id);
      const bUnlocked = achievements && achievements.includes(b.id);

      if (sortBy === "unlocked") {
        return aUnlocked === bUnlocked ? 0 : aUnlocked ? -1 : 1;
      } else if (sortBy === "locked") {
        return aUnlocked === bUnlocked ? 0 : aUnlocked ? 1 : -1;
      }
      return 0;
    });

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-system-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-system-gray rounded-lg shadow-system p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-system-purple-300 flex items-center mb-4 md:mb-0">
            <FaTrophy className="mr-2" />
            Achievements
          </h1>

          <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search achievements"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-system-black border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white w-full md:w-64"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-4 pr-10 py-2 bg-system-black border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white appearance-none"
              >
                <option value="default">Sort: Default</option>
                <option value="unlocked">Sort: Unlocked First</option>
                <option value="locked">Sort: Locked First</option>
              </select>
              <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredAchievements.map((achievement) => {
              const isUnlocked =
                achievements && achievements.includes(achievement.id);

              return (
                <motion.div
                  key={achievement.id}
                  variants={itemVariants}
                  layout
                  className={`relative rounded-lg overflow-hidden border ${
                    isUnlocked ? "border-system-purple-500" : "border-gray-700"
                  } hover:shadow-lg transition-shadow duration-300`}
                >
                  <div
                    className={`p-5 ${
                      isUnlocked
                        ? "bg-system-black"
                        : "bg-gray-900 bg-opacity-70"
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <div
                        className={`text-3xl mr-3 ${
                          isUnlocked ? "" : "text-gray-600"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div>
                        <h3
                          className={`font-semibold ${
                            isUnlocked
                              ? "text-system-purple-300"
                              : "text-gray-500"
                          }`}
                        >
                          {achievement.title}
                        </h3>
                        <p
                          className={`text-sm ${
                            isUnlocked ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {achievement.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span
                        className={`text-sm ${
                          isUnlocked
                            ? "text-system-purple-300"
                            : "text-gray-600"
                        }`}
                      >
                        +{achievement.xpReward} XP
                      </span>
                      <div
                        className={`rounded-full p-2 ${
                          isUnlocked
                            ? "bg-system-purple-500 text-white"
                            : "bg-gray-800 text-gray-600"
                        }`}
                      >
                        {isUnlocked ? <FaCheck /> : <FaLock />}
                      </div>
                    </div>
                  </div>

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-system-black bg-opacity-80 px-4 py-2 rounded-lg border border-gray-700">
                        <FaLock className="inline mr-2 text-gray-500" />
                        <span className="text-gray-400">Locked</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredAchievements.length === 0 && (
          <div className="bg-system-black p-8 rounded-lg border border-gray-700 text-center">
            <p className="text-gray-400">No achievements match your search.</p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-system-gray rounded-lg shadow-system p-6"
      >
        <h2 className="text-xl font-bold text-system-purple-300 mb-4">
          Achievement Progress
        </h2>

        <div className="bg-system-black p-4 rounded-lg border border-system-purple-700 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Achievements Unlocked</span>
            <span className="text-system-purple-300 font-bold">
              {achievements ? achievements.length : 0} /{" "}
              {achievementsArray.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${
                  achievements
                    ? (achievements.length / achievementsArray.length) * 100
                    : 0
                }%`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-system-purple-500 h-2.5 rounded-full"
            ></motion.div>
          </div>
        </div>

        <div className="bg-system-black p-4 rounded-lg border border-system-purple-700">
          <h3 className="text-lg font-semibold text-system-purple-300 mb-3">
            How to Earn Achievements
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-system-purple-400 mr-2">•</span>
              <span>Complete daily and weekly quests regularly</span>
            </li>
            <li className="flex items-start">
              <span className="text-system-purple-400 mr-2">•</span>
              <span>
                Maintain a streak by completing at least one quest every day
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-system-purple-400 mr-2">•</span>
              <span>Create and complete dungeon runs (quest chains)</span>
            </li>
            <li className="flex items-start">
              <span className="text-system-purple-400 mr-2">•</span>
              <span>Level up by earning XP from completed quests</span>
            </li>
            <li className="flex items-start">
              <span className="text-system-purple-400 mr-2">•</span>
              <span>Unlock special titles by reaching certain milestones</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Achievements;
