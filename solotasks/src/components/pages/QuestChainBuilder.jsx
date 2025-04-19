// src/pages/QuestChainBuilder.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTrash,
  FaClock,
  FaTrophy,
  FaPlay,
  FaSave,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaInfoCircle,
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { addQuest } from "../../store/slices/questsSlice";
import { addNotification } from "../../store/slices/uiSlice";
import toast from "react-hot-toast";

const QuestChainBuilder = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.quests);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(300); // 5 minutes in seconds
  const [xp, setXp] = useState(100);
  const [steps, setSteps] = useState([
    { id: uuidv4(), title: "", description: "" },
  ]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Clear form errors when inputs change
  useEffect(() => {
    if (title.trim()) {
      setFormErrors((prev) => ({ ...prev, title: null }));
    }
  }, [title]);

  useEffect(() => {
    const hasEmptyStep = steps.some((step) => !step.title.trim());
    if (!hasEmptyStep) {
      setFormErrors((prev) => ({ ...prev, steps: null }));
    }
  }, [steps]);

  const handleAddStep = () => {
    setSteps([...steps, { id: uuidv4(), title: "", description: "" }]);
  };

  const handleRemoveStep = (id) => {
    if (steps.length <= 1) {
      toast.error("A dungeon run must have at least one step");
      return;
    }
    setSteps(steps.filter((step) => step.id !== id));
  };

  const handleStepChange = (id, field, value) => {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    );
  };

  const moveStep = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap positions
    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];

    setSteps(newSteps);
  };

  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = "Please enter a title for the dungeon run";
    }

    const emptyStepIndex = steps.findIndex((step) => !step.title.trim());
    if (emptyStepIndex !== -1) {
      errors.steps = `Step ${emptyStepIndex + 1} must have a title`;
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

    setIsSubmitting(true);

    try {
      // Create quest chain
      const questChain = {
        title,
        description,
        type: "custom",
        isChain: true,
        timeLimit,
        xp,
        steps,
        completed: false,
        createdAt: new Date(),
        userId: user.uid,
        difficulty: Math.ceil(steps.length / 2), // Difficulty based on number of steps
      };

      await dispatch(addQuest(questChain)).unwrap();

      dispatch(
        addNotification({
          type: "success",
          title: "Dungeon Run Created",
          message: `${title} is ready to be conquered!`,
          duration: 3000,
        })
      );

      // Reset form
      setTitle("");
      setDescription("");
      setTimeLimit(300);
      setXp(100);
      setSteps([{ id: uuidv4(), title: "", description: "" }]);
      setFormErrors({});
      setShowPreview(false);

      toast.success("Dungeon run created successfully!");
    } catch (error) {
      toast.error("Failed to create dungeon run. Please try again.");
      console.error("Error creating dungeon run:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate estimated completion time
  const estimatedTime = steps.length * 5; // 5 minutes per step as an estimate

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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-system-gray rounded-lg shadow-system p-6"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6"
        >
          <h1 className="text-2xl font-bold text-system-purple-300 mb-2 sm:mb-0">
            Create Dungeon Run
          </h1>
          <div className="text-sm text-gray-400">
            Chain multiple tasks together with a time limit for bonus rewards
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          >
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Dungeon Name*
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 bg-system-black border ${
                  formErrors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-system-purple-700 focus:ring-system-purple-500"
                } rounded-md focus:outline-none focus:ring-2 text-white`}
                placeholder="e.g., Demon Castle Raid"
                maxLength={50}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FaExclamationTriangle className="mr-1" />
                  {formErrors.title}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-system-black border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white"
                placeholder="e.g., Clear all tasks within the castle"
                maxLength={100}
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Time Limit
              </label>
              <div className="flex items-center">
                <FaClock className="text-system-purple-400 mr-2" />
                <input
                  type="range"
                  min="60"
                  max="3600"
                  step="60"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 text-white font-mono">
                  {formatTime(timeLimit)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Complete all steps within this time for maximum XP
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                XP Reward
              </label>
              <div className="flex items-center">
                <FaTrophy className="text-system-purple-400 mr-2" />
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={xp}
                  onChange={(e) => setXp(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 text-white font-mono">{xp} XP</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Base XP reward for completing all steps (time bonus will be
                added)
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-system-purple-300">
                Dungeon Steps*
              </h2>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center text-sm bg-system-purple-600 hover:bg-system-purple-700 text-white px-3 py-1 rounded-md transition-colors"
              >
                <FaPlus className="mr-1" />
                Add Step
              </button>
            </div>

            {formErrors.steps && (
              <div className="mb-3 p-2 bg-red-900 bg-opacity-30 border border-red-700 rounded-md">
                <p className="text-sm text-red-400 flex items-center">
                  <FaExclamationTriangle className="mr-1" />
                  {formErrors.steps}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <AnimatePresence>
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    className="bg-system-black p-4 rounded-lg border border-system-purple-700"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-medium">
                        Step {index + 1}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => moveStep(index, "up")}
                          disabled={index === 0}
                          className={`p-1 rounded ${
                            index === 0
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-gray-400 hover:text-white hover:bg-gray-800"
                          }`}
                          title="Move up"
                        >
                          <FaArrowUp />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(index, "down")}
                          disabled={index === steps.length - 1}
                          className={`p-1 rounded ${
                            index === steps.length - 1
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-gray-400 hover:text-white hover:bg-gray-800"
                          }`}
                          title="Move down"
                        >
                          <FaArrowDown />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(step.id)}
                          className="p-1 text-red-500 hover:text-red-400 hover:bg-gray-800 rounded"
                          title="Remove step"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor={`step-title-${step.id}`}
                          className="block text-sm font-medium text-gray-400 mb-1"
                        >
                          Task Title*
                        </label>
                        <input
                          type="text"
                          id={`step-title-${step.id}`}
                          value={step.title}
                          onChange={(e) =>
                            handleStepChange(step.id, "title", e.target.value)
                          }
                          className={`w-full px-3 py-2 bg-system-gray border ${
                            formErrors.steps && !step.title.trim()
                              ? "border-red-500 focus:ring-red-500"
                              : "border-system-purple-700 focus:ring-system-purple-500"
                          } rounded-md focus:outline-none focus:ring-2 text-white`}
                          placeholder="e.g., Defeat the guards"
                          maxLength={50}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`step-desc-${step.id}`}
                          className="block text-sm font-medium text-gray-400 mb-1"
                        >
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          id={`step-desc-${step.id}`}
                          value={step.description}
                          onChange={(e) =>
                            handleStepChange(
                              step.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-system-gray border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white"
                          placeholder="e.g., Clear the entrance area"
                          maxLength={100}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-between items-center bg-system-black p-4 rounded-lg border border-system-purple-700 mb-6"
          >
            <div className="flex items-center mb-3 sm:mb-0">
              <FaInfoCircle className="text-system-purple-400 mr-2" />
              <div>
                <p className="text-white text-sm">
                  <span className="font-medium">Estimated completion:</span> ~
                  {estimatedTime} minutes
                </p>
                <p className="text-gray-400 text-xs">
                  Difficulty: {Math.ceil(steps.length / 2)}/5 stars
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border border-system-purple-700 text-system-purple-300 rounded-md hover:bg-system-black hover:bg-opacity-50 transition-colors"
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex items-center bg-system-purple-600 hover:bg-system-purple-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Create Dungeon Run
                  </>
                )}
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-system-black p-4 rounded-lg border border-system-purple-700">
                  <h3 className="text-lg font-semibold text-system-purple-300 mb-3">
                    Preview
                  </h3>

                  <div className="bg-system-gray p-4 rounded-lg border border-system-purple-700 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-system-purple-300">
                          {title || "Untitled Dungeon"}
                        </h3>
                        <p className="text-gray-300 mt-1">
                          {description || "No description provided"}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="bg-system-purple-600 text-white px-2 py-1 rounded text-xs mr-2">
                            DUNGEON RUN
                          </span>
                          <span className="text-system-purple-200 text-sm flex items-center">
                            <span className="mr-1">{xp} XP</span>
                            <span className="flex items-center ml-3">
                              <FaClock className="mr-1" />
                              {formatTime(timeLimit)}
                            </span>
                          </span>
                        </div>
                      </div>

                      <button className="bg-system-purple-500 p-2 rounded-full hover:bg-system-purple-600 transition-colors">
                        <FaPlay />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Steps:</h4>
                    {steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-system-gray rounded-md"
                      >
                        <div className="w-6 h-6 rounded-full bg-system-purple-700 flex items-center justify-center mr-3 text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white">
                            {step.title || "Untitled step"}
                          </p>
                          {step.description && (
                            <p className="text-xs text-gray-400">
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-system-gray rounded-lg shadow-system p-6 mt-6"
      >
        <h2 className="text-xl font-bold text-system-purple-300 mb-4">
          How Dungeon Runs Work
        </h2>

        <div className="bg-system-black p-4 rounded-lg border border-system-purple-700">
          <ol className="space-y-3 text-gray-300 list-decimal pl-5">
            <li>
              <span className="text-system-purple-300 font-medium">
                Create a Dungeon Run
              </span>{" "}
              by defining a series of steps that need to be completed in
              sequence.
            </li>
            <li>
              <span className="text-system-purple-300 font-medium">
                Set a time limit
              </span>{" "}
              - completing all steps within this time will earn you a time
              bonus.
            </li>
            <li>
              <span className="text-system-purple-300 font-medium">
                Start the Dungeon Run
              </span>{" "}
              when you're ready to begin the tasks.
            </li>
            <li>
              <span className="text-system-purple-300 font-medium">
                Complete each step
              </span>{" "}
              and mark it as done to progress through the dungeon.
            </li>
            <li>
              <span className="text-system-purple-300 font-medium">
                Earn XP rewards
              </span>{" "}
              when you complete all steps, with bonus XP based on how quickly
              you finished.
            </li>
          </ol>

          <div className="mt-4 text-sm text-gray-400">
            <p>
              <span className="text-system-purple-300">Pro Tip:</span> Create
              dungeon runs for related tasks or projects to stay focused and
              motivated!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuestChainBuilder;
