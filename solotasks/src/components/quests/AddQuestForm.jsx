// src/components/quests/AddQuestForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaStar,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheck,
  FaTimes,
  FaLightbulb,
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { addQuest } from "../../store/slices/questsSlice";
import { addNotification } from "../../store/slices/uiSlice";
import toast from "react-hot-toast";

const AddQuestForm = ({ type = "daily" }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.quests);

  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [xp, setXp] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [showTips, setShowTips] = useState(false);

  // Set initial XP value when component mounts or type changes
  useEffect(() => {
    setXp(calculateXP(difficulty, type));
  }, [type]);

  // Calculate XP based on difficulty and type
  const calculateXP = (difficultyLevel, questType) => {
    const baseXP = difficultyLevel * 10;

    // Bonus XP based on quest type
    const typeMultiplier =
      questType === "daily"
        ? 1
        : questType === "weekly"
        ? 1.5
        : questType === "custom"
        ? 1.2
        : 1;

    return Math.round(baseXP * typeMultiplier);
  };

  // Update XP when difficulty changes
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setXp(calculateXP(newDifficulty, type));
  };

  // Clear specific error when field changes
  useEffect(() => {
    if (formErrors.title && title.trim()) {
      setFormErrors((prev) => ({ ...prev, title: null }));
    }
  }, [title, formErrors.title]);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = "Quest title is required";
    } else if (title.length > 50) {
      errors.title = "Title must be less than 50 characters";
    }

    if (description.length > 200) {
      errors.description = "Description must be less than 200 characters";
    }

    // Validate due date is not in the past
    if (dueDate) {
      const selectedDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.dueDate = "Due date cannot be in the past";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Show toast for the first error
      const firstError = Object.values(formErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    const newQuest = {
      id: uuidv4(),
      title,
      description,
      type,
      difficulty,
      xp: xp || calculateXP(difficulty, type),
      completed: false,
      createdAt: new Date(),
      userId: user.uid,
      ...(dueDate && { dueDate: new Date(dueDate) }),
    };

    try {
      await dispatch(addQuest(newQuest)).unwrap();

      dispatch(
        addNotification({
          type: "success",
          title: "New Quest Added",
          message: `"${title}" has been added to your ${type} quests.`,
          duration: 3000,
        })
      );

      // Reset form
      setTitle("");
      setDescription("");
      setDifficulty(1);
      setDueDate("");
      setXp(calculateXP(1, type));
      setFormErrors({});
      setIsExpanded(false);

      toast.success("Quest added successfully!");
    } catch (error) {
      toast.error("Failed to add quest. Please try again.");
      console.error("Error adding quest:", error);
    }
  };

  const renderDifficultyStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleDifficultyChange(i)}
          aria-label={`Set difficulty to ${i}`}
          className={`text-xl ${
            i <= difficulty ? "text-yellow-400" : "text-gray-600"
          } hover:text-yellow-300 focus:outline-none focus:ring-1 focus:ring-system-purple-500 rounded`}
        >
          <FaStar />
        </button>
      );
    }
    return stars;
  };

  // Get minimum date for date picker (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Quest tips based on type
  const getQuestTips = () => {
    switch (type) {
      case "daily":
        return [
          "Keep daily quests achievable within 24 hours",
          "Use daily quests for building habits",
          "Set a consistent difficulty level for recurring tasks",
        ];
      case "weekly":
        return [
          "Weekly quests should be larger goals",
          "Break down complex weekly quests into daily steps",
          "Set a due date to help with planning",
        ];
      case "custom":
        return [
          "Use custom quests for one-time tasks",
          "Higher difficulty = more XP rewards",
          "Add detailed descriptions for clarity",
        ];
      default:
        return [
          "Be specific with your quest titles",
          "Set realistic difficulty levels",
          "Add due dates for time-sensitive tasks",
        ];
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="mt-4">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="add-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(true)}
            className="w-full py-3 px-4 bg-system-black border border-dashed border-system-purple-500 rounded-lg text-system-purple-300 flex items-center justify-center hover:bg-system-gray hover:border-system-purple-400 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add New {type.charAt(0).toUpperCase() + type.slice(1)} Quest
          </motion.button>
        ) : (
          <motion.div
            key="form-container"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-system-black border border-system-purple-700 rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-system-purple-300">
                Create New {type.charAt(0).toUpperCase() + type.slice(1)} Quest
              </h3>
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className="text-system-purple-300 hover:text-system-purple-200 p-1 rounded-full"
                aria-label="Show quest tips"
              >
                <FaLightbulb />
              </button>
            </div>

            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-system-purple-900 bg-opacity-20 border border-system-purple-700 rounded-md"
                >
                  <h4 className="text-system-purple-300 text-sm font-medium mb-2 flex items-center">
                    <FaInfoCircle className="mr-2" />
                    Tips for {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
                    Quests
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {getQuestTips().map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-system-purple-400 mr-2">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Quest Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-2 bg-system-gray border ${
                    formErrors.title
                      ? "border-red-500"
                      : "border-system-purple-700"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white`}
                  placeholder="e.g., Complete workout routine"
                  maxLength={50}
                />
                <div className="flex justify-between mt-1">
                  <AnimatePresence>
                    {formErrors.title && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-500 flex items-center"
                      >
                        <FaExclamationTriangle className="mr-1" />
                        {formErrors.title}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <span className="text-xs text-gray-500">
                    {title.length}/50
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className={`w-full px-3 py-2 bg-system-gray border ${
                    formErrors.description
                      ? "border-red-500"
                      : "border-system-purple-700"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white`}
                  placeholder="e.g., 30 minutes of cardio and strength training"
                  maxLength={200}
                ></textarea>
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">
                    {description.length}/200
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Difficulty Level
                  </label>
                  <div className="flex space-x-1">
                    {renderDifficultyStars()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {difficulty === 1
                      ? "Very Easy"
                      : difficulty === 2
                      ? "Easy"
                      : difficulty === 3
                      ? "Medium"
                      : difficulty === 4
                      ? "Hard"
                      : "Very Hard"}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Due Date (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dueDate"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={getMinDate()}
                      className={`w-full pl-10 pr-3 py-2 bg-system-gray border ${
                        formErrors.dueDate
                          ? "border-red-500"
                          : "border-system-purple-700"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white`}
                    />
                  </div>
                  <AnimatePresence>
                    {formErrors.dueDate && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-500 flex items-center mt-1"
                      >
                        <FaExclamationTriangle className="mr-1" />
                        {formErrors.dueDate}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-400">
                    XP Reward
                  </label>
                  <span className="text-system-purple-300 font-bold">
                    {xp} XP
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(xp / 50) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-system-purple-500 h-2.5 rounded-full"
                  ></motion.div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  XP is calculated based on difficulty and quest type
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setTitle("");
                    setDescription("");
                    setDifficulty(1);
                    setDueDate("");
                    setFormErrors({});
                  }}
                  className="flex items-center px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <FaTimes className="mr-1" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-system-purple-600 hover:bg-system-purple-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-1" />
                      Add Quest
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddQuestForm;
