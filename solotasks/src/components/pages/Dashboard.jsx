// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import QuestList from "../components/quests/QuestList";
import StatsPanel from "../components/stats/StatsPanel";
import AddQuestForm from "../components/quests/AddQuestForm";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const { dailyQuests, weeklyQuests, customQuests, questChains } = useSelector(
    (state) => state.quests
  );
  const { user } = useSelector((state) => state.auth);
  const { level, currentTitle } = useSelector((state) => state.userStats);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-3/4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-system-gray p-6 rounded-lg shadow-system mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-system-purple-300">
                Welcome,{" "}
                <span className="text-white">{user?.username || "Hunter"}</span>
              </h1>
              <div className="text-right">
                <div className="text-sm text-gray-400">Level {level}</div>
                <div className="text-system-purple-300">{currentTitle}</div>
              </div>
            </div>

            <div className="flex border-b border-system-purple-700 mb-4">
              <button
                onClick={() => setActiveTab("daily")}
                className={`py-2 px-4 ${
                  activeTab === "daily"
                    ? "border-b-2 border-system-purple-500 text-system-purple-300"
                    : "text-gray-400"
                }`}
              >
                Daily Quests
              </button>
              <button
                onClick={() => setActiveTab("weekly")}
                className={`py-2 px-4 ${
                  activeTab === "weekly"
                    ? "border-b-2 border-system-purple-500 text-system-purple-300"
                    : "text-gray-400"
                }`}
              >
                Weekly Quests
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`py-2 px-4 ${
                  activeTab === "custom"
                    ? "border-b-2 border-system-purple-500 text-system-purple-300"
                    : "text-gray-400"
                }`}
              >
                Custom Quests
              </button>
              <button
                onClick={() => setActiveTab("chains")}
                className={`py-2 px-4 ${
                  activeTab === "chains"
                    ? "border-b-2 border-system-purple-500 text-system-purple-300"
                    : "text-gray-400"
                }`}
              >
                Dungeon Runs
              </button>
            </div>

            {activeTab === "daily" && <QuestList quests={dailyQuests} />}
            {activeTab === "weekly" && <QuestList quests={weeklyQuests} />}
            {activeTab === "custom" && <QuestList quests={customQuests} />}
            {activeTab === "chains" && <QuestList quests={questChains} />}

            <AddQuestForm type={activeTab} />
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
