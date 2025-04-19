// src/components/quests/QuestItem.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaCheckCircle,
  FaTrash,
  FaEdit,
  FaClock,
  FaCalendarAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import { completeQuest, deleteQuest } from "../../store/slices/questsSlice";
import { updateUserXP } from "../../store/slices/userStatsSlice";
import { addNotification } from "../../store/slices/uiSlice";
import toast from "react-hot-toast";

const QuestItem = ({ quest }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await dispatch(completeQuest(quest.id)).unwrap();
      await dispatch(
        updateUserXP({ userId: quest.userId, xpToAdd: quest.xp })
      ).unwrap();

      dispatch(
        addNotification({
          type: "success",
          title: "Quest Completed!",
          message: `You gained ${quest.xp} XP!`,
          duration: 3000,
        })
      );

      toast.success(`Quest completed! +${quest.xp} XP`);
    } catch (error) {
      console.error("Failed to complete quest:", error);
      toast.error("Failed to complete quest");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteQuest(quest.id)).unwrap();

      dispatch(
        addNotification({
          type: "info",
          title: "Quest Deleted",
          message: `"${quest.title}" has been deleted.`,
          duration: 3000,
        })
      );

      toast.success("Quest deleted successfully");
    } catch (error) {
      console.error("Failed to delete quest:", error);
      toast.error("Failed to delete quest");
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const getDifficultyStars = () => {
    const stars = [];
    for (let i = 0; i < quest.difficulty; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    }
    return stars;
  };

  // Check if quest is due soon (within 24 hours)
  const isDueSoon = () => {
    if (!quest.dueDate) return false;
    const dueDate = new Date(quest.dueDate);
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff > 0 && hoursDiff < 24;
  };

  // Check if quest is overdue
  const isOverdue = () => {
    if (!quest.dueDate) return false;
    const dueDate = new Date(quest.dueDate);
    const now = new Date();
    return dueDate < now;
  };

  // Format the due date with relative time
  const formatDueDate = () => {
    if (!quest.dueDate) return null;

    const dueDate = new Date(quest.dueDate);
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff === 0) return "Due today";
    if (daysDiff === 1) return "Due tomorrow";
    if (daysDiff === -1) return "Due yesterday";
    if (daysDiff < 0) return `Overdue by ${Math.abs(daysDiff)} days`;
    if (daysDiff <= 7) return `Due in ${daysDiff} days`;

    return `Due: ${dueDate.toLocaleDateString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
      transition={{ duration: 0.3 }}
      className={`bg-system-gray p-4 rounded-lg border ${
        isOverdue()
          ? "border-red-500"
          : isDueSoon()
          ? "border-yellow-500"
          : "border-system-purple-500"
      } mb-4 shadow-system hover:shadow-lg transition-all duration-200`}
      layout
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-system-purple-300 break-words">
            {quest.title}
          </h3>
          {quest.description && (
            <p className="text-gray-300 mt-1 break-words">
              {quest.description}
            </p>
          )}
          <div className="flex flex-wrap items-center mt-2 gap-2">
            <span
              className={`text-white px-2 py-1 rounded text-xs ${
                quest.type === "daily"
                  ? "bg-system-purple-500"
                  : quest.type === "weekly"
                  ? "bg-blue-600"
                  : "bg-green-600"
              }`}
            >
              {quest.type.toUpperCase()}
            </span>
            <span className="text-system-purple-200 text-sm flex items-center">
              <span className="mr-1">{quest.xp} XP</span>
              <span className="flex ml-2">{getDifficultyStars()}</span>
            </span>

            {quest.dueDate && (
              <span
                className={`text-xs flex items-center ${
                  isOverdue()
                    ? "text-red-400"
                    : isDueSoon()
                    ? "text-yellow-400"
                    : "text-gray-400"
                }`}
              >
                <FaCalendarAlt className="mr-1" />
                {formatDueDate()}
              </span>
            )}
          </div>
        </div>

        <div className="flex">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleComplete}
            disabled={isLoading}
            className="bg-green-600 p-2 rounded-full mr-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Complete quest"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <FaCheckCircle />
            )}
          </motion.button>

          {showConfirmDelete ? (
            <div className="flex">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-600 p-2 rounded-full mr-2 hover:bg-gray-700 transition-colors"
                aria-label="Cancel delete"
              >
                <FaTimes />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Confirm delete quest"
              >
                {isDeleting ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <FaCheck />
                )}
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowConfirmDelete(true)}
              className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors"
              aria-label="Delete quest"
            >
              <FaTrash />
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOverdue() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex items-center text-red-400 text-xs"
          >
            <FaExclamationCircle className="mr-1" />
            This quest is overdue! Complete it as soon as possible.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Created date */}
      <div className="mt-2 text-xs text-gray-500">
        Created: {new Date(quest.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
};

export default QuestItem;
