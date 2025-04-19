// src/services/achievementsService.js
import { db } from "../firebase/config";
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  increment,
} from "firebase/firestore";
import { addNotification } from "../store/slices/uiSlice";
import { updateUserXP } from "../store/slices/userStatsSlice";

// List of possible achievements
export const ACHIEVEMENTS = {
  FIRST_QUEST: {
    id: "first_quest",
    title: "First Quest",
    description: "Complete your first quest",
    icon: "🏆",
    xpReward: 50,
    category: "beginner",
  },
  STREAK_3: {
    id: "streak_3",
    title: "Consistent Hunter",
    description: "Maintain a 3-day streak",
    icon: "📆",
    xpReward: 30,
    category: "streak",
  },
  STREAK_7: {
    id: "streak_7",
    title: "Weekly Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    xpReward: 100,
    category: "streak",
  },
  STREAK_30: {
    id: "streak_30",
    title: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "🌟",
    xpReward: 300,
    category: "streak",
  },
  QUEST_MASTER: {
    id: "quest_master",
    title: "Quest Master",
    description: "Complete 50 quests",
    icon: "⚔️",
    xpReward: 200,
    category: "completion",
  },
  QUEST_NOVICE: {
    id: "quest_novice",
    title: "Quest Novice",
    description: "Complete 10 quests",
    icon: "🛡️",
    xpReward: 50,
    category: "completion",
  },
  QUEST_ADEPT: {
    id: "quest_adept",
    title: "Quest Adept",
    description: "Complete 25 quests",
    icon: "🗡️",
    xpReward: 100,
    category: "completion",
  },
  QUEST_LEGEND: {
    id: "quest_legend",
    title: "Quest Legend",
    description: "Complete 100 quests",
    icon: "👑",
    xpReward: 500,
    category: "completion",
  },
  DUNGEON_NOVICE: {
    id: "dungeon_novice",
    title: "Dungeon Novice",
    description: "Complete your first dungeon run",
    icon: "🏯",
    xpReward: 50,
    category: "dungeon",
  },
  DUNGEON_CLEARER: {
    id: "dungeon_clearer",
    title: "Dungeon Clearer",
    description: "Complete 5 dungeon runs",
    icon: "🏰",
    xpReward: 150,
    category: "dungeon",
  },
  DUNGEON_MASTER: {
    id: "dungeon_master",
    title: "Dungeon Master",
    description: "Complete 20 dungeon runs",
    icon: "🔮",
    xpReward: 300,
    category: "dungeon",
  },
  DAILY_DEVOTEE: {
    id: "daily_devotee",
    title: "Daily Devotee",
    description: "Complete 20 daily quests",
    icon: "📅",
    xpReward: 100,
    category: "quest_type",
  },
  WEEKLY_WONDER: {
    id: "weekly_wonder",
    title: "Weekly Wonder",
    description: "Complete 10 weekly quests",
    icon: "📊",
    xpReward: 150,
    category: "quest_type",
  },
  SPEED_RUNNER: {
    id: "speed_runner",
    title: "Speed Runner",
    description: "Complete a dungeon run in half the time limit",
    icon: "⏱️",
    xpReward: 200,
    category: "special",
  },
  LEVEL_UP_5: {
    id: "level_up_5",
    title: "Rising Hunter",
    description: "Reach level 5",
    icon: "📈",
    xpReward: 100,
    category: "level",
  },
  LEVEL_UP_10: {
    id: "level_up_10",
    title: "Established Hunter",
    description: "Reach level 10",
    icon: "📊",
    xpReward: 200,
    category: "level",
  },
  LEVEL_UP_25: {
    id: "level_up_25",
    title: "Elite Hunter",
    description: "Reach level 25",
    icon: "🏅",
    xpReward: 500,
    category: "level",
  },
};

/**
 * Check and award achievements based on user stats
 * @param {string} userId - User ID
 * @param {object} stats - User statistics
 * @param {function} dispatch - Redux dispatch function
 * @returns {Promise<Array>} - Array of awarded achievements
 */
export const checkAchievements = async (userId, stats, dispatch) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User document not found for achievement check");
      return [];
    }

    const userData = userSnap.data();
    const currentAchievements = userData.achievements || [];
    const newAchievements = [];

    // Quest completion achievements
    if (
      stats.completedQuests >= 1 &&
      !currentAchievements.includes(ACHIEVEMENTS.FIRST_QUEST.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.FIRST_QUEST);
    }

    if (
      stats.completedQuests >= 10 &&
      !currentAchievements.includes(ACHIEVEMENTS.QUEST_NOVICE.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.QUEST_NOVICE);
    }

    if (
      stats.completedQuests >= 25 &&
      !currentAchievements.includes(ACHIEVEMENTS.QUEST_ADEPT.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.QUEST_ADEPT);
    }

    if (
      stats.completedQuests >= 50 &&
      !currentAchievements.includes(ACHIEVEMENTS.QUEST_MASTER.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.QUEST_MASTER);
    }

    if (
      stats.completedQuests >= 100 &&
      !currentAchievements.includes(ACHIEVEMENTS.QUEST_LEGEND.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.QUEST_LEGEND);
    }

    // Streak achievements
    if (
      stats.streak >= 3 &&
      !currentAchievements.includes(ACHIEVEMENTS.STREAK_3.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.STREAK_3);
    }

    if (
      stats.streak >= 7 &&
      !currentAchievements.includes(ACHIEVEMENTS.STREAK_7.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.STREAK_7);
    }

    if (
      stats.streak >= 30 &&
      !currentAchievements.includes(ACHIEVEMENTS.STREAK_30.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.STREAK_30);
    }

    // Level achievements
    if (
      stats.level >= 5 &&
      !currentAchievements.includes(ACHIEVEMENTS.LEVEL_UP_5.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.LEVEL_UP_5);
    }

    if (
      stats.level >= 10 &&
      !currentAchievements.includes(ACHIEVEMENTS.LEVEL_UP_10.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.LEVEL_UP_10);
    }

    if (
      stats.level >= 25 &&
      !currentAchievements.includes(ACHIEVEMENTS.LEVEL_UP_25.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.LEVEL_UP_25);
    }

    // Dungeon achievements
    if (
      stats.completedDungeons >= 1 &&
      !currentAchievements.includes(ACHIEVEMENTS.DUNGEON_NOVICE.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.DUNGEON_NOVICE);
    }

    if (
      stats.completedDungeons >= 5 &&
      !currentAchievements.includes(ACHIEVEMENTS.DUNGEON_CLEARER.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.DUNGEON_CLEARER);
    }

    if (
      stats.completedDungeons >= 20 &&
      !currentAchievements.includes(ACHIEVEMENTS.DUNGEON_MASTER.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.DUNGEON_MASTER);
    }

    // Quest type achievements
    if (
      stats.completedDailyQuests >= 20 &&
      !currentAchievements.includes(ACHIEVEMENTS.DAILY_DEVOTEE.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.DAILY_DEVOTEE);
    }

    if (
      stats.completedWeeklyQuests >= 10 &&
      !currentAchievements.includes(ACHIEVEMENTS.WEEKLY_WONDER.id)
    ) {
      newAchievements.push(ACHIEVEMENTS.WEEKLY_WONDER);
    }

    // Award new achievements
    if (newAchievements.length > 0) {
      const achievementIds = newAchievements.map((a) => a.id);
      const totalXpReward = newAchievements.reduce(
        (sum, a) => sum + a.xpReward,
        0
      );

      try {
        // Update user document with new achievements and XP
        await updateDoc(userRef, {
          achievements: arrayUnion(...achievementIds),
          totalXp: increment(totalXpReward),
          xp: increment(totalXpReward),
          // Add achievement timestamps
          achievementHistory: arrayUnion(
            ...newAchievements.map((achievement) => ({
              id: achievement.id,
              title: achievement.title,
              unlockedAt: new Date(),
              xpReward: achievement.xpReward,
            }))
          ),
        });

        // Update Redux state with new XP
        if (dispatch) {
          dispatch(
            updateUserXP({
              userId,
              xpToAdd: totalXpReward,
              skipAchievementCheck: true, // Prevent infinite loop
            })
          );
        }

        // Show notification for each achievement
        if (dispatch) {
          // Delay notifications slightly for better UX if multiple achievements
          newAchievements.forEach((achievement, index) => {
            setTimeout(() => {
              dispatch(
                addNotification({
                  type: "achievement",
                  title: "Achievement Unlocked!",
                  message: `${achievement.title}: ${achievement.description} (+${achievement.xpReward} XP)`,
                  duration: 5000,
                  icon: achievement.icon,
                })
              );
            }, index * 1000); // Stagger notifications by 1 second
          });
        }

        return newAchievements;
      } catch (error) {
        console.error("Error awarding achievements:", error);
        return [];
      }
    }

    return newAchievements;
  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
};

/**
 * Check for special achievements that don't depend on stats
 * @param {string} userId - User ID
 * @param {object} data - Achievement-specific data
 * @param {function} dispatch - Redux dispatch function
 */
export const checkSpecialAchievement = async (userId, data, dispatch) => {
  try {
    // Check for speed runner achievement
    if (
      data.type === "dungeon_completion" &&
      data.timeRemaining &&
      data.timeLimit
    ) {
      const timeUsedPercentage =
        (data.timeLimit - data.timeRemaining) / data.timeLimit;

      if (timeUsedPercentage <= 0.5) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const currentAchievements = userData.achievements || [];

        if (!currentAchievements.includes(ACHIEVEMENTS.SPEED_RUNNER.id)) {
          await updateDoc(userRef, {
            achievements: arrayUnion(ACHIEVEMENTS.SPEED_RUNNER.id),
            totalXp: increment(ACHIEVEMENTS.SPEED_RUNNER.xpReward),
            xp: increment(ACHIEVEMENTS.SPEED_RUNNER.xpReward),
            achievementHistory: arrayUnion({
              id: ACHIEVEMENTS.SPEED_RUNNER.id,
              title: ACHIEVEMENTS.SPEED_RUNNER.title,
              unlockedAt: new Date(),
              xpReward: ACHIEVEMENTS.SPEED_RUNNER.xpReward,
            }),
          });

          if (dispatch) {
            dispatch(
              updateUserXP({
                userId,
                xpToAdd: ACHIEVEMENTS.SPEED_RUNNER.xpReward,
                skipAchievementCheck: true,
              })
            );

            dispatch(
              addNotification({
                type: "achievement",
                title: "Achievement Unlocked!",
                message: `${ACHIEVEMENTS.SPEED_RUNNER.title}: ${ACHIEVEMENTS.SPEED_RUNNER.description} (+${ACHIEVEMENTS.SPEED_RUNNER.xpReward} XP)`,
                duration: 5000,
                icon: ACHIEVEMENTS.SPEED_RUNNER.icon,
              })
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking special achievement:", error);
  }
};

/**
 * Get all achievements for a user with unlock status
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of achievements with unlock status
 */
export const getUserAchievements = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return Object.values(ACHIEVEMENTS).map((achievement) => ({
        ...achievement,
        unlocked: false,
      }));
    }

    const userData = userSnap.data();
    const unlockedAchievements = userData.achievements || [];

    return Object.values(ACHIEVEMENTS).map((achievement) => ({
      ...achievement,
      unlocked: unlockedAchievements.includes(achievement.id),
      unlockedAt:
        userData.achievementHistory?.find((a) => a.id === achievement.id)
          ?.unlockedAt || null,
    }));
  } catch (error) {
    console.error("Error getting user achievements:", error);
    return [];
  }
};

/**
 * Get achievement categories
 * @returns {Array} - Array of unique achievement categories
 */
export const getAchievementCategories = () => {
  const categories = new Set(
    Object.values(ACHIEVEMENTS).map((a) => a.category)
  );
  return Array.from(categories);
};

/**
 * Get achievements by category
 * @param {string} category - Achievement category
 * @returns {Array} - Array of achievements in the category
 */
export const getAchievementsByCategory = (category) => {
  return Object.values(ACHIEVEMENTS).filter((a) => a.category === category);
};
