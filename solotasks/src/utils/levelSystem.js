// Calculate XP required for next level
export const getXpForNextLevel = (level) => {
  return level * 100; // Simple formula: level * 100 XP needed
};

// Calculate progress percentage to next level
export const getLevelProgress = (currentXp, level) => {
  const xpNeeded = getXpForNextLevel(level);
  return Math.min(Math.floor((currentXp / xpNeeded) * 100), 100);
};

// Get title based on level
export const getTitleForLevel = (level) => {
  if (level < 5) return "Novice Hunter";
  if (level < 10) return "E-Rank Hunter";
  if (level < 15) return "D-Rank Hunter";
  if (level < 20) return "C-Rank Hunter";
  if (level < 25) return "B-Rank Hunter";
  if (level < 30) return "A-Rank Hunter";
  if (level < 40) return "S-Rank Hunter";
  if (level < 50) return "National Level Hunter";
  return "Shadow Monarch";
};

// Unlock new UI theme based on level
export const getThemeForLevel = (level) => {
  if (level < 10) return "default";
  if (level < 20) return "elite";
  if (level < 30) return "shadow";
  return "monarch";
};
