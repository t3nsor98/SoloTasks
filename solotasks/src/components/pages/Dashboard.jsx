// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaFilter, FaSort, FaEye, FaEyeSlash } from "react-icons/fa";
import QuestList from "../../components/quests/QuestList";
import StatsPanel from "../../components/stats/StatsPanel";
import AddQuestForm from "../../components/quests/AddQuestForm";
import { fetchQuests } from "../../store/slices/questsSlice";
import { fetchUserStats } from "../../store/slices/userStatsSlice";
import toast from "react-hot-toast";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, xp-high, xp-low

  const { dailyQuests, weeklyQuests, customQuests, questChains, isLoading } =
    useSelector((state) => state.quests);
  const { user } = useSelector((state) => state.auth);
  const { level, currentTitle } = useSelector((state) => state.userStats);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchQuests(user.uid))
        .unwrap()
        .catch((err) => {
          toast.error("Failed to load quests");
          console.error("Error fetching quests:", err);
        });

      dispatch(fetchUserStats(user.uid))
        .unwrap()
        .catch((err) => {
          console.error("Error fetching user stats:", err);
        });
    }
  }, [dispatch, user]);

  // Filter and sort quests
  const filterAndSortQuests = (quests) => {
    // First filter by completion status if needed
    let filteredQuests = showCompleted
      ? quests
      : quests.filter((quest) => !quest.completed);

    // Then filter by search term
    if (searchTerm) {
      filteredQuests = filteredQuests.filter(
        (quest) =>
          quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (quest.description &&
            quest.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Then sort
    return filteredQuests.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "xp-high":
          return b.xp - a.xp;
        case "xp-low":
          return a.xp - b.xp;
        default:
          return 0;
      }
    });
  };

  const filteredDailyQuests = filterAndSortQuests(dailyQuests);
  const filteredWeeklyQuests = filterAndSortQuests(weeklyQuests);
  const filteredCustomQuests = filterAndSortQuests(customQuests);
  const filteredQuestChains = filterAndSortQuests(questChains);

  // Get active quests count (for tabs)
  const activeDailyCount = dailyQuests.filter((q) => !q.completed).length;
  const activeWeeklyCount = weeklyQuests.filter((q) => !q.completed).length;
  const activeCustomCount = customQuests.filter((q) => !q.completed).length;
  const activeChainCount = questChains.filter((q) => !q.completed).length;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-3/4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="bg-system-gray p-6 rounded-lg shadow-system mb-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h1 className="text-2xl font-bold text-system-purple-300 mb-3 sm:mb-0">
                Welcome,{" "}
                <span className="text-white">{user?.username || "Hunter"}</span>
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="text-sm text-gray-400 mr-2">Level {level}</div>
                <div className="text-system-purple-300">{currentTitle}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
              <div className="flex overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("daily")}
                  className={`py-2 px-4 whitespace-nowrap ${
                    activeTab === "daily"
                      ? "border-b-2 border-system-purple-500 text-system-purple-300"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Daily ({activeDailyCount})
                </button>
                <button
                  onClick={() => setActiveTab("weekly")}
                  className={`py-2 px-4 whitespace-nowrap ${
                    activeTab === "weekly"
                      ? "border-b-2 border-system-purple-500 text-system-purple-300"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Weekly ({activeWeeklyCount})
                </button>
                <button
                  onClick={() => setActiveTab("custom")}
                  className={`py-2 px-4 whitespace-nowrap ${
                    activeTab === "custom"
                      ? "border-b-2 border-system-purple-500 text-system-purple-300"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Custom ({activeCustomCount})
                </button>
                <button
                  onClick={() => setActiveTab("chains")}
                  className={`py-2 px-4 whitespace-nowrap ${
                    activeTab === "chains"
                      ? "border-b-2 border-system-purple-500 text-system-purple-300"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  Dungeons ({activeChainCount})
                </button>
              </div>

              <div className="flex space-x-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-system-black border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white w-full sm:w-48"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`p-2 rounded-md ${
                      showCompleted
                        ? "bg-system-purple-600 text-white"
                        : "bg-system-black text-gray-400 border border-system-purple-700"
                    }`}
                    title={
                      showCompleted
                        ? "Hide completed quests"
                        : "Show completed quests"
                    }
                  >
                    {showCompleted ? <FaEye /> : <FaEyeSlash />}
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-system-black border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white appearance-none"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="xp-high">XP: High to Low</option>
                    <option value="xp-low">XP: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-b border-system-purple-700 mb-6"></div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-system-purple-500"></div>
                  </div>
                ) : (
                  <>
                    {activeTab === "daily" && (
                      <>
                        <QuestList quests={filteredDailyQuests} />
                        {filteredDailyQuests.length === 0 && !isLoading && (
                          <div className="bg-system-black p-8 rounded-lg border border-system-purple-700 text-center">
                            <p className="text-gray-400">
                              {searchTerm
                                ? "No daily quests match your search."
                                : showCompleted
                                ? "No daily quests available."
                                : "You've completed all your daily quests!"}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {activeTab === "weekly" && (
                      <>
                        <QuestList quests={filteredWeeklyQuests} />
                        {filteredWeeklyQuests.length === 0 && !isLoading && (
                          <div className="bg-system-black p-8 rounded-lg border border-system-purple-700 text-center">
                            <p className="text-gray-400">
                              {searchTerm
                                ? "No weekly quests match your search."
                                : showCompleted
                                ? "No weekly quests available."
                                : "You've completed all your weekly quests!"}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {activeTab === "custom" && (
                      <>
                        <QuestList quests={filteredCustomQuests} />
                        {filteredCustomQuests.length === 0 && !isLoading && (
                          <div className="bg-system-black p-8 rounded-lg border border-system-purple-700 text-center">
                            <p className="text-gray-400">
                              {searchTerm
                                ? "No custom quests match your search."
                                : showCompleted
                                ? "No custom quests available."
                                : "You've completed all your custom quests!"}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {activeTab === "chains" && (
                      <>
                        <QuestList quests={filteredQuestChains} />
                        {filteredQuestChains.length === 0 && !isLoading && (
                          <div className="bg-system-black p-8 rounded-lg border border-system-purple-700 text-center">
                            <p className="text-gray-400">
                              {searchTerm
                                ? "No dungeon runs match your search."
                                : showCompleted
                                ? "No dungeon runs available."
                                : "You've completed all your dungeon runs!"}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <AddQuestForm
              type={activeTab === "chains" ? "custom" : activeTab}
            />
          </motion.div>
        </div>

        <div className="md:w-1/4">
          <StatsPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
