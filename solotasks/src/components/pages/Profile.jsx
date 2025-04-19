// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEdit,
  FaTrophy,
  FaCrown,
  FaCamera,
  FaChartLine,
  FaCalendarAlt,
  FaHistory,
} from "react-icons/fa";
import { updateProfile } from "../../store/slices/authSlice";
import { fetchUserStats } from "../../store/slices/userStatsSlice";
import { storage, db } from "../../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import {
  getTitleForLevel,
  getLevelProgress,
  getXpForNextLevel,
} from "../../utils/levelSystem";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    level,
    xp,
    totalXp,
    titles,
    currentTitle,
    achievements,
    completedQuests,
    streak,
    lastActive,
    isLoading: statsLoading,
  } = useSelector((state) => state.userStats);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activityHistory, setActivityHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserStats(user.uid));
      fetchActivityHistory(user.uid);
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
    }
    if (currentTitle) {
      setSelectedTitle(currentTitle);
    }
  }, [user, currentTitle]);

  const fetchActivityHistory = async (userId) => {
    try {
      // This would ideally be a separate collection in Firestore
      // For now, we'll simulate with completed quests data
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().completedQuestHistory) {
        setActivityHistory(userDoc.data().completedQuestHistory);
      }
    } catch (error) {
      console.error("Error fetching activity history:", error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image too large. Maximum size is 2MB.");
        return;
      }

      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate username
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setIsLoading(true);

    try {
      let profileImageUrl = user.profileImageUrl;

      // Upload new profile image if selected
      if (profileImage) {
        const imageRef = ref(storage, `profile-images/${user.uid}`);
        await uploadBytes(imageRef, profileImage);
        profileImageUrl = await getDownloadURL(imageRef);
      }

      // Update user profile in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username,
        profileImageUrl,
        currentTitle: selectedTitle,
        updatedAt: new Date(),
      });

      // Update user in Redux
      dispatch(
        updateProfile({
          username,
          profileImageUrl,
          currentTitle: selectedTitle,
        })
      );

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress to next level
  const progress = getLevelProgress(xp, level);
  const xpNeeded = getXpForNextLevel(level);

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

  if (statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-system-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-system-gray rounded-lg shadow-system p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <motion.h1
            variants={itemVariants}
            className="text-2xl font-bold text-system-purple-300 mb-4 md:mb-0 flex items-center"
          >
            <FaUser className="mr-2" />
            Hunter Profile
          </motion.h1>
          {!isEditing && (
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center bg-system-purple-600 hover:bg-system-purple-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <FaEdit className="mr-2" />
              Edit Profile
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form
              key="edit-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="mb-4 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-system-purple-500 mb-4 relative group">
                      <img
                        src={
                          imagePreview ||
                          user.profileImageUrl ||
                          "https://via.placeholder.com/150?text=Hunter"
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaCamera className="text-white text-2xl" />
                      </div>
                    </div>
                    <label className="bg-system-purple-600 hover:bg-system-purple-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors flex items-center">
                      <FaCamera className="mr-2" />
                      Change Avatar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Maximum file size: 2MB
                    </p>
                  </div>
                </div>

                <div className="md:w-2/3">
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-system-black border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white"
                      maxLength={20}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      Title
                    </label>
                    <select
                      id="title"
                      value={selectedTitle}
                      onChange={(e) => setSelectedTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-system-black border border-system-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-system-purple-500 text-white"
                    >
                      {titles && titles.length > 0 ? (
                        titles.map((title, index) => (
                          <option key={index} value={title}>
                            {title}
                          </option>
                        ))
                      ) : (
                        <option value="Novice Hunter">Novice Hunter</option>
                      )}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-system-purple-600 hover:bg-system-purple-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="profile-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col md:flex-row gap-6"
            >
              <div className="md:w-1/3 flex flex-col items-center">
                <motion.div
                  variants={itemVariants}
                  className="w-32 h-32 rounded-full overflow-hidden border-4 border-system-purple-500 mb-4 shadow-lg"
                >
                  <img
                    src={
                      user?.profileImageUrl ||
                      "https://via.placeholder.com/150?text=Hunter"
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.h2
                  variants={itemVariants}
                  className="text-xl font-bold text-white mb-1"
                >
                  {user?.username || "Unknown Hunter"}
                </motion.h2>
                <motion.div
                  variants={itemVariants}
                  className="flex items-center text-system-purple-300"
                >
                  <FaCrown className="mr-1" />
                  <span>{currentTitle || getTitleForLevel(level)}</span>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="mt-4 bg-system-black p-3 rounded-lg border border-system-purple-700 w-full"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400">Level {level}</span>
                    <span className="text-xs text-system-purple-300">
                      {xp}/{xpNeeded} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-system-purple-500 h-2 rounded-full"
                    ></motion.div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="mt-4 text-center"
                >
                  <p className="text-sm text-gray-400">
                    Member since{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </motion.div>
              </div>

              <div className="md:w-2/3">
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                >
                  <div className="bg-system-black p-4 rounded-lg border border-system-purple-700 hover:shadow-system transition-shadow duration-300">
                    <div className="flex items-center text-gray-400 mb-1">
                      <FaChartLine className="mr-2 text-system-purple-400" />
                      <span>Level</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{level}</div>
                  </div>
                  <div className="bg-system-black p-4 rounded-lg border border-system-purple-700 hover:shadow-system transition-shadow duration-300">
                    <div className="flex items-center text-gray-400 mb-1">
                      <FaTrophy className="mr-2 text-system-purple-400" />
                      <span>Total XP</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {totalXp || 0}
                    </div>
                  </div>
                  <div className="bg-system-black p-4 rounded-lg border border-system-purple-700 hover:shadow-system transition-shadow duration-300">
                    <div className="flex items-center text-gray-400 mb-1">
                      <FaCalendarAlt className="mr-2 text-system-purple-400" />
                      <span>Quests Completed</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {completedQuests || 0}
                    </div>
                  </div>
                  <div className="bg-system-black p-4 rounded-lg border border-system-purple-700 hover:shadow-system transition-shadow duration-300">
                    <div className="flex items-center text-gray-400 mb-1">
                      <FaCrown className="mr-2 text-system-purple-400" />
                      <span>Rank</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {level < 10
                        ? "E"
                        : level < 20
                        ? "D"
                        : level < 30
                        ? "C"
                        : level < 40
                        ? "B"
                        : level < 50
                        ? "A"
                        : "S"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {level < 10
                        ? "Beginner Hunter"
                        : level < 20
                        ? "Novice Hunter"
                        : level < 30
                        ? "Skilled Hunter"
                        : level < 40
                        ? "Elite Hunter"
                        : level < 50
                        ? "Master Hunter"
                        : "Monarch"}
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mb-4">
                  <h3 className="text-lg font-semibold text-system-purple-300 mb-2 flex items-center">
                    <FaTrophy className="mr-2" />
                    Available Titles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {titles && titles.length > 0 ? (
                      titles.map((title, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm ${
                            title === currentTitle
                              ? "bg-system-purple-500 text-white"
                              : "bg-system-black text-gray-300 border border-system-purple-700"
                          } hover:shadow-sm transition-shadow duration-300`}
                        >
                          {title}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">
                        No titles unlocked yet. Complete quests to earn titles!
                      </span>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mb-4">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center text-system-purple-300 hover:text-system-purple-200 transition-colors"
                  >
                    <FaHistory className="mr-2" />
                    {showHistory
                      ? "Hide Activity History"
                      : "Show Activity History"}
                  </button>

                  <AnimatePresence>
                    {showHistory && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 bg-system-black p-3 rounded-lg border border-system-purple-700 overflow-hidden"
                      >
                        {activityHistory && activityHistory.length > 0 ? (
                          <div className="max-h-48 overflow-y-auto">
                            {activityHistory.map((activity, index) => (
                              <div
                                key={index}
                                className="py-2 border-b border-gray-800 last:border-0"
                              >
                                <div className="text-sm text-white">
                                  {activity.title}
                                </div>
                                <div className="text-xs text-gray-400 flex justify-between">
                                  <span>{activity.type} quest</span>
                                  <span>
                                    {new Date(
                                      activity.completedAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm py-2">
                            No activity recorded yet.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-system-gray rounded-lg shadow-system p-6"
      >
        <h2 className="text-xl font-bold text-system-purple-300 mb-4 flex items-center">
          <FaTrophy className="mr-2" />
          Achievements
        </h2>

        {achievements && achievements.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {achievements.map((achievementId, index) => {
              const achievement = {
                id: achievementId,
                title:
                  achievementId === "first_quest"
                    ? "First Quest"
                    : achievementId === "streak_7"
                    ? "Weekly Warrior"
                    : achievementId === "quest_master"
                    ? "Quest Master"
                    : achievementId === "dungeon_clearer"
                    ? "Dungeon Clearer"
                    : "Unknown Achievement",
                description:
                  achievementId === "first_quest"
                    ? "Completed your first quest"
                    : achievementId === "streak_7"
                    ? "Maintained a 7-day streak"
                    : achievementId === "quest_master"
                    ? "Completed 50 quests"
                    : achievementId === "dungeon_clearer"
                    ? "Completed 5 quest chains"
                    : "",
                icon:
                  achievementId === "first_quest"
                    ? "🏆"
                    : achievementId === "streak_7"
                    ? "🔥"
                    : achievementId === "quest_master"
                    ? "⚔️"
                    : achievementId === "dungeon_clearer"
                    ? "🏰"
                    : "🎯",
              };

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-system-black p-4 rounded-lg border border-system-purple-700 hover:shadow-system transition-shadow duration-300"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{achievement.icon}</span>
                    <div>
                      <h3 className="font-semibold text-system-purple-300">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="bg-system-black p-6 rounded-lg border border-system-purple-700 text-center">
            <p className="text-gray-400">
              No achievements unlocked yet. Complete quests to earn
              achievements!
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-4 py-2 bg-system-purple-600 hover:bg-system-purple-700 text-white rounded-md transition-colors"
            >
              View Available Quests
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
