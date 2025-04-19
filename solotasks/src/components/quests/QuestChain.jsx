import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClock,
  FaPlay,
  FaStop,
  FaCheck,
  FaTrophy,
  FaExclamationTriangle,
  FaInfoCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import { completeQuestChain } from "../../store/slices/questsSlice";
import { updateUserXP } from "../../store/slices/userStatsSlice";
import { addNotification } from "../../store/slices/uiSlice";
import toast from "react-hot-toast";

const QuestChain = ({ chain }) => {
  const dispatch = useDispatch();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);

  const progressRef = useRef(null);

  // Check if time is running out (80% of time limit)
  useEffect(() => {
    if (isRunning && timer > chain.timeLimit * 0.8 && !timeWarning) {
      setTimeWarning(true);
      dispatch(
        addNotification({
          type: "warning",
          title: "Time Running Out!",
          message: `Hurry! You're running out of time in ${chain.title}!`,
          duration: 3000,
        })
      );
    }
  }, [timer, chain.timeLimit, isRunning, timeWarning, dispatch, chain.title]);

  // Scroll to the progress bar when step changes
  useEffect(() => {
    if (isRunning && progressRef.current) {
      progressRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentStep, isRunning]);

  const startChain = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setTimer(0);
    setTimeWarning(false);

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

    // Automatically show details when starting
    setShowDetails(true);
  };

  const stopChain = () => {
    if (intervalId) clearInterval(intervalId);
    setIsRunning(false);
    setCurrentStep(0);
    setTimer(0);
    setTimeWarning(false);

    dispatch(
      addNotification({
        type: "warning",
        title: "Dungeon Run Abandoned",
        message: "You have left the dungeon without completing it.",
        duration: 3000,
      })
    );
  };

  const completeStep = async () => {
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
      setIsSubmitting(true);

      try {
        const timeBonus = Math.max(0, chain.timeLimit - timer);
        const timeBonusXp = Math.floor(timeBonus / 10);
        const totalXp = chain.xp + timeBonusXp;

        await dispatch(completeQuestChain(chain.id)).unwrap();
        await dispatch(
          updateUserXP({ userId: chain.userId, xpToAdd: totalXp })
        ).unwrap();

        dispatch(
          addNotification({
            type: "success",
            title: "Dungeon Cleared!",
            message: `You've completed ${chain.title} and earned ${totalXp} XP (including ${timeBonusXp} time bonus)!`,
            duration: 5000,
          })
        );

        toast.success(`Dungeon cleared! +${totalXp} XP`);
      } catch (error) {
        console.error("Error completing quest chain:", error);
        toast.error("Failed to complete dungeon run");
      } finally {
        setIsRunning(false);
        setCurrentStep(0);
        setTimer(0);
        setTimeWarning(false);
        setIsSubmitting(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate time remaining percentage
  const getTimeRemainingPercentage = () => {
    if (!isRunning) return 100;
    return Math.max(0, 100 - (timer / chain.timeLimit) * 100);
  };

  // Get time color based on remaining time
  const getTimeColor = () => {
    const percentage = getTimeRemainingPercentage();
    if (percentage > 60) return "text-green-400";
    if (percentage > 30) return "text-yellow-400";
    return "text-red-400";
  };

  // Calculate estimated XP including time bonus
  const calculateEstimatedXp = () => {
    if (!isRunning) return chain.xp;
    const timeBonus = Math.max(0, chain.timeLimit - timer);
    return chain.xp + Math.floor(timeBonus / 10);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-system-gray p-4 rounded-lg border ${
        isRunning
          ? timeWarning
            ? "border-red-500 shadow-red-900/20"
            : "border-system-purple-400 shadow-system"
          : "border-system-purple-500 shadow-system"
      } mb-4 transition-colors duration-300`}
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
          <div className="flex items-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-system-black p-2 rounded-full mr-2 hover:bg-gray-800 transition-colors"
              aria-label={showDetails ? "Hide details" : "Show details"}
            >
              <FaInfoCircle />
            </button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startChain}
              className="bg-system-purple-500 p-2 rounded-full hover:bg-system-purple-600 transition-colors"
              aria-label="Start dungeon run"
            >
              <FaPlay />
            </motion.button>
          </div>
        ) : (
          <div className="flex">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={stopChain}
              className="bg-red-600 p-2 rounded-full mr-2 hover:bg-red-700 transition-colors"
              disabled={isSubmitting}
              aria-label="Abandon dungeon run"
            >
              <FaStop />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={completeStep}
              className="bg-green-600 p-2 rounded-full hover:bg-green-700 transition-colors"
              disabled={isSubmitting}
              aria-label="Complete current step"
            >
              {isSubmitting ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <FaCheck />
              )}
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDetails && !isRunning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-system-black p-3 rounded-lg border border-system-purple-700"
          >
            <h4 className="text-sm font-medium text-system-purple-300 mb-2">
              Dungeon Steps:
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {chain.steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-system-purple-900 flex items-center justify-center mr-2 flex-shrink-0 text-xs text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white text-sm">{step.title}</p>
                    {step.description && (
                      <p className="text-gray-400 text-xs">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between items-center">
              <div className="flex items-center text-xs text-gray-400">
                <FaTrophy className="text-system-purple-400 mr-1" />
                <span>Difficulty: {chain.difficulty}/5</span>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <FaHourglassHalf className="text-system-purple-400 mr-1" />
                <span>Time Limit: {formatTime(chain.timeLimit)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
            ref={progressRef}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">
                Step {currentStep + 1}/{chain.steps.length}:{" "}
                <span className="text-white">
                  {chain.steps[currentStep].title}
                </span>
              </span>
              <span className={`text-sm ${getTimeColor()} flex items-center`}>
                <FaClock className="mr-1" />
                Time: {formatTime(timer)} / {formatTime(chain.timeLimit)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              {/* Progress bar for steps */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Progress</div>
                <div className="bg-gray-700 h-2 rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (currentStep / (chain.steps.length - 1)) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.3 }}
                    className="bg-system-purple-500 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>

              {/* Time remaining bar */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Time Remaining</div>
                <div className="bg-gray-700 h-2 rounded-full">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: `${getTimeRemainingPercentage()}%` }}
                    className={`h-2 rounded-full ${
                      getTimeRemainingPercentage() > 60
                        ? "bg-green-500"
                        : getTimeRemainingPercentage() > 30
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></motion.div>
                </div>
              </div>
            </div>

            <div className="bg-system-black p-3 rounded-lg border border-system-purple-700">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-white">
                  <p className="font-medium">
                    {chain.steps[currentStep].title}
                  </p>
                  {chain.steps[currentStep].description && (
                    <p className="text-gray-400 text-xs mt-1">
                      {chain.steps[currentStep].description}
                    </p>
                  )}
                </div>
                <div className="bg-system-purple-900 px-2 py-1 rounded text-xs text-white">
                  {currentStep + 1} of {chain.steps.length}
                </div>
              </div>

              {timeWarning && (
                <div className="mt-2 flex items-center text-red-400 text-xs">
                  <FaExclamationTriangle className="mr-1" />
                  Time is running out! Complete this step quickly!
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  {chain.steps.length - currentStep - 1} steps remaining
                </div>
                <div className="text-xs text-system-purple-300 flex items-center">
                  <FaTrophy className="mr-1" />
                  Estimated XP: {calculateEstimatedXp()}
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <button
                onClick={completeStep}
                className="bg-system-purple-600 hover:bg-system-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Completing...
                  </div>
                ) : currentStep < chain.steps.length - 1 ? (
                  "Mark Step as Complete"
                ) : (
                  "Complete Dungeon Run"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestChain;
