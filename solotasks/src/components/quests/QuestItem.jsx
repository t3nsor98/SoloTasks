// src/components/quests/QuestItem.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FaStar, FaCheckCircle, FaTrash, FaEdit } from "react-icons/fa";
import { completeQuest, deleteQuest } from "../../store/slices/questsSlice";
import { updateUserXP } from "../../store/slices/userStatsSlice";
import { addNotification } from "../../store/slices/uiSlice";

const QuestItem = ({ quest }) => {
  const dispatch = useDispatch();

  const handleComplete = () => {
    dispatch(completeQuest(quest.id));
    dispatch(updateUserXP({ userId: quest.userId, xpToAdd: quest.xp }));
    dispatch(
      addNotification({
        type: "success",
        title: "Quest Completed!",
        message: `You gained ${quest.xp} XP!`,
        duration: 3000,
      })
    );
  };

  const getDifficultyStars = () => {
    const stars = [];
    for (let i = 0; i < quest.difficulty; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-system-gray p-4 rounded-lg border border-system-purple-500 mb-4 shadow-system"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-system-purple-300">
            {quest.title}
          </h3>
          <p className="text-gray-300 mt-1">{quest.description}</p>
          <div className="flex items-center mt-2">
            <span className="bg-system-purple-500 text-white px-2 py-1 rounded text-xs mr-2">
              {quest.type.toUpperCase()}
            </span>
            <span className="text-system-purple-200 text-sm flex items-center">
              <span className="mr-1">{quest.xp} XP</span>
              <span className="flex ml-2">{getDifficultyStars()}</span>
            </span>
          </div>
        </div>
        <div className="flex">
          <button
            onClick={handleComplete}
            className="bg-green-600 p-2 rounded-full mr-2 hover:bg-green-700 transition-colors"
          >
            <FaCheckCircle />
          </button>
          <button
            onClick={() => dispatch(deleteQuest(quest.id))}
            className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      {quest.dueDate && (
        <div className="mt-2 text-xs text-gray-400">
          Due: {new Date(quest.dueDate).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
};

export default QuestItem;
