// src/components/quests/QuestList.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import QuestItem from "./QuestItem";
import QuestChain from "./QuestChain";
import {
  FaExclamationTriangle,
  FaSort,
  FaFilter,
  FaCalendarAlt,
  FaTrophy,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const QuestList = ({ quests, isCompletedList = false }) => {
  const { isLoading } = useSelector((state) => state.quests);
  const [sortedQuests, setSortedQuests] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Sort and filter quests whenever dependencies change
  useEffect(() => {
    if (!quests) return;

    // First filter the quests
    let filteredQuests = [...quests];

    // Apply search filter
    if (searchTerm) {
      filteredQuests = filteredQuests.filter(
        (quest) =>
          quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (quest.description &&
            quest.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterBy !== "all") {
      if (filterBy === "due-soon") {
        filteredQuests = filteredQuests.filter((quest) => {
          if (!quest.dueDate) return false;
          const dueDate = new Date(quest.dueDate);
          const now = new Date();
          const timeDiff = dueDate.getTime() - now.getTime();
          const daysDiff = timeDiff / (1000 * 3600 * 24);
          return daysDiff >= 0 && daysDiff <= 2; // Due within 2 days
        });
      } else if (filterBy === "high-xp") {
        filteredQuests = filteredQuests.filter((quest) => quest.xp >= 30);
      } else if (filterBy === "chains") {
        filteredQuests = filteredQuests.filter((quest) => quest.isChain);
      } else if (filterBy === "tasks") {
        filteredQuests = filteredQuests.filter((quest) => !quest.isChain);
      }
    }

    // Then sort the filtered quests
    let sorted = [...filteredQuests];

    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "xp-high":
        sorted.sort((a, b) => b.xp - a.xp);
        break;
      case "xp-low":
        sorted.sort((a, b) => a.xp - b.xp);
        break;
      case "due-date":
        sorted.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        break;
      case "difficulty":
        sorted.sort((a, b) => b.difficulty - a.difficulty);
        break;
      case "newest":
      default:
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setSortedQuests(sorted);
  }, [quests, sortBy, filterBy, searchTerm]);

  // Get counts for filter categories
  const getDueSoonCount = () => {
    if (!quests) return 0;
    return quests.filter((quest) => {
      if (!quest.dueDate) return false;
      const dueDate = new Date(quest.dueDate);
      const now = new Date();
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      return daysDiff >= 0 && daysDiff <= 2;
    }).length;
  };

  const getHighXpCount = () => {
    if (!quests) return 0;
    return quests.filter((quest) => quest.xp >= 30).length;
  };

  const getChainsCount = () => {
    if (!quests) return 0;
    return quests.filter((quest) => quest.isChain).length;
  };

  const getTasksCount = () => {
    if (!quests) return 0;
    return quests.filter((quest) => !quest.isChain).length;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-system-purple-700 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-system-purple-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-system-purple-700 rounded"></div>
              <div className="h-4 bg-system-purple-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we have quests but none match the filters
  if (quests && quests.length > 0 && sortedQuests.length === 0) {
    return (
      <div className="space-y-4 my-4">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-system-purple-300 hover:text-system-purple-200 transition-colors mb-2 sm:mb-0"
            >
              <FaFilter className="mr-1" />
              Filters & Sort
              {showFilters ? (
                <FaChevronUp className="ml-1" />
              ) : (
                <FaChevronDown className="ml-1" />
              )}
            </button>

            <div className="relative w-full sm:w-auto">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search quests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-system-black border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white w-full sm:w-64"
              />
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-system-black border border-system-purple-700 rounded-lg p-4 mb-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-system-gray border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="xp-high">Highest XP</option>
                      <option value="xp-low">Lowest XP</option>
                      <option value="due-date">Due Date</option>
                      <option value="difficulty">Difficulty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Filter By
                    </label>
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="w-full px-3 py-2 bg-system-gray border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white"
                    >
                      <option value="all">All Quests ({quests.length})</option>
                      <option value="due-soon">
                        Due Soon ({getDueSoonCount()})
                      </option>
                      <option value="high-xp">
                        High XP ({getHighXpCount()})
                      </option>
                      <option value="chains">
                        Dungeon Runs ({getChainsCount()})
                      </option>
                      <option value="tasks">
                        Single Tasks ({getTasksCount()})
                      </option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between">
                  <button
                    onClick={() => {
                      setSortBy("newest");
                      setFilterBy("all");
                      setSearchTerm("");
                    }}
                    className="text-sm text-system-purple-300 hover:text-system-purple-200"
                  >
                    Reset Filters
                  </button>

                  <div className="text-sm text-gray-400">
                    Showing:{" "}
                    <span className="text-white">{sortedQuests.length}</span> of{" "}
                    <span className="text-white">{quests.length}</span> quests
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-system-black border border-system-purple-700 rounded-lg p-6 text-center my-4"
        >
          <FaExclamationTriangle className="text-system-purple-400 text-3xl mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-2">
            No Matching Quests
          </h3>
          <p className="text-gray-400">
            No quests match your current filters or search terms.
          </p>
          <button
            onClick={() => {
              setSortBy("newest");
              setFilterBy("all");
              setSearchTerm("");
            }}
            className="mt-4 px-4 py-2 bg-system-purple-600 text-white rounded-md hover:bg-system-purple-700 transition-colors"
          >
            Clear Filters
          </button>
        </motion.div>
      </div>
    );
  }

  if (!quests || quests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-system-black border border-system-purple-700 rounded-lg p-6 text-center my-4"
      >
        <FaExclamationTriangle className="text-system-purple-400 text-3xl mx-auto mb-3" />
        <h3 className="text-lg font-medium text-white mb-2">
          No Quests Available
        </h3>
        <p className="text-gray-400">
          {quests && quests.length === 0
            ? "You haven't created any quests in this category yet."
            : "Failed to load quests. Please try again."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 my-4">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-system-purple-300 hover:text-system-purple-200 transition-colors mb-2 sm:mb-0"
          >
            <FaFilter className="mr-1" />
            Filters & Sort
            {showFilters ? (
              <FaChevronUp className="ml-1" />
            ) : (
              <FaChevronDown className="ml-1" />
            )}
          </button>

          <div className="relative w-full sm:w-auto">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search quests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-system-black border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white w-full sm:w-64"
            />
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-system-black border border-system-purple-700 rounded-lg p-4 mb-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-system-gray border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="xp-high">Highest XP</option>
                    <option value="xp-low">Lowest XP</option>
                    <option value="due-date">Due Date</option>
                    <option value="difficulty">Difficulty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Filter By
                  </label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-full px-3 py-2 bg-system-gray border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white"
                  >
                    <option value="all">All Quests ({quests.length})</option>
                    <option value="due-soon">
                      Due Soon ({getDueSoonCount()})
                    </option>
                    <option value="high-xp">
                      High XP ({getHighXpCount()})
                    </option>
                    <option value="chains">
                      Dungeon Runs ({getChainsCount()})
                    </option>
                    <option value="tasks">
                      Single Tasks ({getTasksCount()})
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between">
                <button
                  onClick={() => {
                    setSortBy("newest");
                    setFilterBy("all");
                    setSearchTerm("");
                  }}
                  className="text-sm text-system-purple-300 hover:text-system-purple-200"
                >
                  Reset Filters
                </button>

                <div className="text-sm text-gray-400">
                  Showing:{" "}
                  <span className="text-white">{sortedQuests.length}</span> of{" "}
                  <span className="text-white">{quests.length}</span> quests
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {sortedQuests.map((quest) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            transition={{ duration: 0.3 }}
            layout
          >
            {quest.isChain ? (
              <QuestChain chain={quest} />
            ) : (
              <QuestItem quest={quest} isCompleted={isCompletedList} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {sortedQuests.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-6">
          Showing {sortedQuests.length}{" "}
          {sortedQuests.length === 1 ? "quest" : "quests"}
        </div>
      )}
    </div>
  );
};

export default QuestList;
