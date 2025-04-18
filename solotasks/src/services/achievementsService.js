import { db } from "../firebase/config";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { addNotification } from "../store/slices/uiSlice";

// List of possible achievements
export const ACHIEVEMENTS = {
  FIRST_QUEST: {
    id: "first_quest",
    title: "First Quest",
    description: "Complete your first quest",
    icon: "🏆",
    xpReward: 50,
  },
  STREAK_7: {
    id: "streak_7",
    title: "Weekly Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    xpReward: 100,
  },
  QUEST_MASTER: {
    id: "quest_master",
    title: "Quest Master",
    description: "Complete 50 quests",
    icon: "⚔️",
    xpReward: 200,
  },
  DUNGEON_CLEARER: {
    id: "dungeon_clearer",
    title: "Dungeon Clearer",
    description: "Complete 5 quest chains",
    icon: "🏰",
    xpReward: 150,
  },
  // Add more achievements
};

// Check and award achievements
export const checkAchievements = async (userId, stats, dispatch) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const currentAchievements = userData.achievements || [];
  const newAchievements = [];

  // Check for first quest achievement
  if (
    stats.completedQuests >= 1 &&
    !currentAchievements.includes(ACHIEVEMENTS.FIRST_QUEST.id)
  ) {
    newAchievements.push(ACHIEVEMENTS.FIRST_QUEST);
  }

  // Check for streak achievement
  if (
    stats.streak >= 7 &&
    !currentAchievements.includes(ACHIEVEMENTS.STREAK_7.id)
  ) {
    newAchievements.push(ACHIEVEMENTS.STREAK_7);
  }

  // Check for quest master achievement
  if (
    stats.completedQuests >= 50 &&
    !currentAchievements.includes(ACHIEVEMENTS.QUEST_MASTER.id)
  ) {
    newAchievements.push(ACHIEVEMENTS.QUEST_MASTER);
  }

  // Award new achievements
  if (newAchievements.length > 0) {
    const achievementIds = newAchievements.map((a) => a.id);
    const totalXpReward = newAchievements.reduce(
      (sum, a) => sum + a.xpReward,
      0
    );

    await updateDoc(userRef, {
      achievements: arrayUnion(...achievementIds),
      totalXp: userData.totalXp + totalXpReward,
      xp: userData.xp + totalXpReward,
    });

    // Show notification for each achievement
    newAchievements.forEach((achievement) => {
      dispatch(
        addNotification({
          type: "achievement",
          title: "Achievement Unlocked!",
          message: `${achievement.title}: ${achievement.description} (+${achievement.xpReward} XP)`,
          duration: 5000,
        })
      );
    });
  }
};
