// src/utils/levelSystem.js



/**
 * Calculate XP required for next level
 * @param {number} level - Current level
 * @returns {number} - XP needed for next level
 */
export const getXpForNextLevel = (level) => {
  // Base formula: level * 100 XP needed
  // Add slight curve for higher levels to increase challenge
  if (level < 10) {
    return level * 100;
  } else if (level < 20) {
    return level * 120;
  } else if (level < 30) {
    return level * 150;
  } else if (level < 40) {
    return level * 200;
  } else {
    return level * 250;
  }
};

/**
 * Calculate progress percentage to next level
 * @param {number} currentXp - Current XP
 * @param {number} level - Current level
 * @returns {number} - Progress percentage (0-100)
 */
export const getLevelProgress = (currentXp, level) => {
  const xpNeeded = getXpForNextLevel(level);
  return Math.min(Math.floor((currentXp / xpNeeded) * 100), 100);
};

/**
 * Calculate total XP needed to reach a specific level from level 1
 * @param {number} targetLevel - Target level
 * @returns {number} - Total XP needed
 */
export const getTotalXpForLevel = (targetLevel) => {
  let totalXp = 0;
  for (let i = 1; i < targetLevel; i++) {
    totalXp += getXpForNextLevel(i);
  }
  return totalXp;
};

/**
 * Calculate level based on total XP
 * @param {number} totalXp - Total XP accumulated
 * @returns {object} - Level information { level, remainingXp, progress }
 */
export const getLevelFromTotalXp = (totalXp) => {
  let level = 1;
  let remainingXp = totalXp;

  while (remainingXp >= getXpForNextLevel(level)) {
    remainingXp -= getXpForNextLevel(level);
    level++;
  }

  const xpForNextLevel = getXpForNextLevel(level);
  const progress = Math.min(
    Math.floor((remainingXp / xpForNextLevel) * 100),
    100
  );

  return {
    level,
    remainingXp,
    progress,
    xpForNextLevel,
  };
};

/**
 * Get title based on level
 * @param {number} level - Current level
 * @returns {string} - Title for the level
 */
export const getTitleForLevel = (level) => {
  if (level < 5) return "Novice Hunter";
  if (level < 10) return "E-Rank Hunter";
  if (level < 15) return "D-Rank Hunter";
  if (level < 20) return "C-Rank Hunter";
  if (level < 25) return "B-Rank Hunter";
  if (level < 30) return "A-Rank Hunter";
  if (level < 40) return "S-Rank Hunter";
  if (level < 50) return "National Level Hunter";
  if (level < 70) return "Shadow Monarch";
  if (level < 100) return "Ruler of Shadows";
  return "God of Destruction";
};

/**
 * Get all available titles up to current level
 * @param {number} level - Current level
 * @returns {Array} - Array of available titles
 */
export const getAvailableTitles = (level) => {
  const titles = [];

  if (level >= 1) titles.push("Novice Hunter");
  if (level >= 5) titles.push("E-Rank Hunter");
  if (level >= 10) titles.push("D-Rank Hunter");
  if (level >= 15) titles.push("C-Rank Hunter");
  if (level >= 20) titles.push("B-Rank Hunter");
  if (level >= 25) titles.push("A-Rank Hunter");
  if (level >= 30) titles.push("S-Rank Hunter");
  if (level >= 40) titles.push("National Level Hunter");
  if (level >= 50) titles.push("Shadow Monarch");
  if (level >= 70) titles.push("Ruler of Shadows");
  if (level >= 100) titles.push("God of Destruction");

  return titles;
};

/**
 * Unlock new UI theme based on level
 * @param {number} level - Current level
 * @returns {string} - Theme name
 */
export const getThemeForLevel = (level) => {
  if (level < 10) return "default";
  if (level < 20) return "elite";
  if (level < 30) return "shadow";
  if (level < 50) return "monarch";
  return "destruction";
};

/**
 * Get all available themes up to current level
 * @param {number} level - Current level
 * @returns {Array} - Array of available themes
 */
export const getAvailableThemes = (level) => {
  const themes = ["default"];

  if (level >= 10) themes.push("elite");
  if (level >= 20) themes.push("shadow");
  if (level >= 30) themes.push("monarch");
  if (level >= 50) themes.push("destruction");

  return themes;
};

/**
 * Calculate estimated time to reach next level based on XP rate
 * @param {number} currentXp - Current XP
 * @param {number} level - Current level
 * @param {number} xpPerDay - Average XP earned per day
 * @returns {number} - Estimated days to next level
 */
export const getEstimatedTimeToNextLevel = (currentXp, level, xpPerDay) => {
  if (!xpPerDay || xpPerDay <= 0) return Infinity;

  const xpNeeded = getXpForNextLevel(level);
  const xpRemaining = xpNeeded - currentXp;

  return Math.ceil(xpRemaining / xpPerDay);
};

/**
 * Calculate estimated time to reach target level based on XP rate
 * @param {number} currentLevel - Current level
 * @param {number} currentXp - Current XP
 * @param {number} targetLevel - Target level
 * @param {number} xpPerDay - Average XP earned per day
 * @returns {number} - Estimated days to target level
 */
export const getEstimatedTimeToTargetLevel = (
  currentLevel,
  currentXp,
  targetLevel,
  xpPerDay
) => {
  if (!xpPerDay || xpPerDay <= 0 || targetLevel <= currentLevel) return 0;

  let totalXpNeeded = 0;

  // Add XP needed to complete current level
  totalXpNeeded += getXpForNextLevel(currentLevel) - currentXp;

  // Add XP needed for all levels in between
  for (let level = currentLevel + 1; level < targetLevel; level++) {
    totalXpNeeded += getXpForNextLevel(level);
  }

  return Math.ceil(totalXpNeeded / xpPerDay);
};

/**
 * Get rank information based on level
 * @param {number} level - Current level
 * @returns {object} - Rank information { rank, title, color, nextRank, xpToNextRank }
 */
export const getRankInfo = (level) => {
  if (level < 5) {
    return {
      rank: "F",
      title: "Novice Hunter",
      color: "text-gray-400",
      nextRank: "E",
      xpToNextRank: getTotalXpForLevel(5) - getTotalXpForLevel(level),
    };
  }
  if (level < 10) {
    return {
      rank: "E",
      title: "E-Rank Hunter",
      color: "text-green-400",
      nextRank: "D",
      xpToNextRank: getTotalXpForLevel(10) - getTotalXpForLevel(level),
    };
  }
  if (level < 15) {
    return {
      rank: "D",
      title: "D-Rank Hunter",
      color: "text-blue-400",
      nextRank: "C",
      xpToNextRank: getTotalXpForLevel(15) - getTotalXpForLevel(level),
    };
  }
  if (level < 20) {
    return {
      rank: "C",
      title: "C-Rank Hunter",
      color: "text-indigo-400",
      nextRank: "B",
      xpToNextRank: getTotalXpForLevel(20) - getTotalXpForLevel(level),
    };
  }
  if (level < 25) {
    return {
      rank: "B",
      title: "B-Rank Hunter",
      color: "text-purple-400",
      nextRank: "A",
      xpToNextRank: getTotalXpForLevel(25) - getTotalXpForLevel(level),
    };
  }
  if (level < 30) {
    return {
      rank: "A",
      title: "A-Rank Hunter",
      color: "text-yellow-400",
      nextRank: "S",
      xpToNextRank: getTotalXpForLevel(30) - getTotalXpForLevel(level),
    };
  }
  if (level < 40) {
    return {
      rank: "S",
      title: "S-Rank Hunter",
      color: "text-orange-400",
      nextRank: "National",
      xpToNextRank: getTotalXpForLevel(40) - getTotalXpForLevel(level),
    };
  }
  if (level < 50) {
    return {
      rank: "National",
      title: "National Level Hunter",
      color: "text-red-400",
      nextRank: "Monarch",
      xpToNextRank: getTotalXpForLevel(50) - getTotalXpForLevel(level),
    };
  }
  if (level < 70) {
    return {
      rank: "Monarch",
      title: "Shadow Monarch",
      color: "text-purple-600",
      nextRank: "Ruler",
      xpToNextRank: getTotalXpForLevel(70) - getTotalXpForLevel(level),
    };
  }
  if (level < 100) {
    return {
      rank: "Ruler",
      title: "Ruler of Shadows",
      color: "text-purple-800",
      nextRank: "God",
      xpToNextRank: getTotalXpForLevel(100) - getTotalXpForLevel(level),
    };
  }
  return {
    rank: "God",
    title: "God of Destruction",
    color: "text-red-600",
    nextRank: null,
    xpToNextRank: 0,
  };
};

/**
 * Get milestone levels where significant changes occur
 * @returns {Array} - Array of milestone levels with descriptions
 */
export const getMilestoneLevels = () => [
  { level: 5, description: "Unlock E-Rank Hunter title" },
  { level: 10, description: "Unlock Elite theme and D-Rank Hunter title" },
  { level: 15, description: "Unlock C-Rank Hunter title" },
  { level: 20, description: "Unlock B-Rank Hunter title" },
  { level: 25, description: "Unlock A-Rank Hunter title" },
  { level: 30, description: "Unlock Shadow theme and S-Rank Hunter title" },
  { level: 40, description: "Unlock National Level Hunter title" },
  { level: 50, description: "Unlock Monarch theme and Shadow Monarch title" },
  { level: 70, description: "Unlock Ruler of Shadows title" },
  {
    level: 100,
    description: "Unlock Destruction theme and God of Destruction title",
  },
];

/**
 * Get next milestone level from current level
 * @param {number} currentLevel - Current level
 * @returns {object|null} - Next milestone or null if max level
 */
export const getNextMilestone = (currentLevel) => {
  const milestones = getMilestoneLevels();
  return milestones.find((milestone) => milestone.level > currentLevel) || null;
};
