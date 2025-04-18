import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FaClock, FaPlay, FaStop, FaCheck } from "react-icons/fa";
import { completeQuestChain } from "../../store/slices/questsSlice";
import { updateUserXP } from "../../store/slices/userStatsSlice";
import { addNotification } from "../../store/slices/uiSlice";

const QuestChain = ({ chain }) => {
  const dispatch = useDispatch();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const startChain = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setTimer(0);

    const id = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    setIntervalId(id);

    dispatch(
      addNotification({
        type: "info",
        title: "Dungeon Run Started",
        message: `You've entered ${chain.title}. Complete all tasks to claim your reward!`,
        duration: 3000,
      })
    );
  };

  const stopChain = () => {
    if (intervalId) clearInterval(intervalId);
    setIsRunning(false);
    setCurrentStep(0);
    setTimer(0);

    dispatch(
      addNotification({
        type: "warning",
        title: "Dungeon Run Abandoned",
        message: "You have left the dungeon without completing it.",
        duration: 3000,
      })
    );
  };

  const completeStep = () => {
    if (currentStep < chain.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);

      dispatch(
        addNotification({
          type: "success",
          title: "Step Completed",
          message: `${chain.steps[currentStep].title} completed!`,
          duration: 2000,
        })
      );
    } else {
      // Complete the entire chain
      if (intervalId) clearInterval(intervalId);

      const timeBonus = Math.max(0, chain.timeLimit - timer);
      const totalXp = chain.xp + Math.floor(timeBonus / 10);

      dispatch(completeQuestChain(chain.id));
      dispatch(updateUserXP({ userId: chain.userId, xpToAdd: totalXp }));

      dispatch(
        addNotification({
          type: "success",
          title: "Dungeon Cleared!",
          message: `You've completed ${
            chain.title
          } and earned ${totalXp} XP (including ${Math.floor(
            timeBonus / 10
          )} time bonus)!`,
          duration: 5000,
        })
      );

      setIsRunning(false);
      setCurrentStep(0);
      setTimer(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
            {chain.title}
          </h3>
          <p className="text-gray-300 mt-1">{chain.description}</p>
          <div className="flex items-center mt-2">
            <span className="bg-system-purple-600 text-white px-2 py-1 rounded text-xs mr-2">
              DUNGEON RUN
            </span>
            <span className="text-system-purple-200 text-sm flex items-center">
              <span className="mr-1">{chain.xp} XP</span>
              <span className="flex items-center ml-3">
                <FaClock className="mr-1" />
                {formatTime(chain.timeLimit)}
              </span>
            </span>
          </div>
        </div>

        {!isRunning ? (
          <button
            onClick={startChain}
            className="bg-system-purple-500 p-2 rounded-full hover:bg-system-purple-600 transition-colors"
          >
            <FaPlay />
          </button>
        ) : (
          <div className="flex">
            <button
              onClick={stopChain}
              className="bg-red-600 p-2 rounded-full mr-2 hover:bg-red-700 transition-colors"
            >
              <FaStop />
            </button>
            <button
              onClick={completeStep}
              className="bg-green-600 p-2 rounded-full hover:bg-green-700 transition-colors"
            >
              <FaCheck />
            </button>
          </div>
        )}
      </div>

      {isRunning && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1}/{chain.steps.length}:{" "}
              {chain.steps[currentStep].title}
            </span>
            <span className="text-sm text-system-purple-300">
              Time: {formatTime(timer)} / {formatTime(chain.timeLimit)}
            </span>
          </div>
          <div className="bg-gray-700 h-2 rounded-full">
            <div
              className="bg-system-purple-500 h-2 rounded-full"
              style={{ width: `${(currentStep / chain.steps.length) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-300">
            {chain.steps[currentStep].description}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default QuestChain;
