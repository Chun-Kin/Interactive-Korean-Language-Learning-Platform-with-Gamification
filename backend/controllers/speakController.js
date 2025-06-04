const db = require('../config/db');

exports.getSpeakingLevels = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Fetch user's progress and skill level
      const [user] = await db.query(
        "SELECT skill_level FROM users WHERE id = ?",
        [userId]
      );
  
      const [progress] = await db.query(
        "SELECT level, experience FROM user_progress WHERE user_id = ?",
        [userId]
      );
  
      if (!user.length || !progress.length) {
        return res.status(404).json({ error: "User progress not found" });
      }
  
      const userLevel = progress[0].level;
      const userSkill = user[0].skill_level;
  
      // Fetch speaking levels
      const [levels] = await db.query(
        "SELECT id, level, title, description, image_url, skill_requirement, exp_required FROM speaking_levels ORDER BY level ASC"
      );
  
      if (levels.length === 0) {
        return res.status(404).json({ error: "No speaking levels found" });
      }
  
      function getSkillLevelValue(skill) {
        const skillHierarchy = ['no experience', 'newbie', 'beginner', 'intermediate', 'expert'];
        return skillHierarchy.indexOf(skill.toLowerCase());
      }
  
      // Determine unlocked levels
        const formattedLevels = levels.map((level) => {
        const withinLevelProgression = userLevel >= level.level;
        const skillMatchesOrBelow = level.skill_requirement === userSkill || getSkillLevelValue(level.skill_requirement) < getSkillLevelValue(userSkill);
        const isUnlocked = withinLevelProgression && skillMatchesOrBelow;
  
        return {
          ...level,
          isUnlocked,
          unlockConditions: {
            withinLevelProgression,
            skillMatchesOrBelow
          }
        };
      });
  
      res.json({ levels: formattedLevels });
    } catch (error) {
      console.error("Error fetching speaking levels:", error);
      res.status(500).json({ error: "Server error" });
    }
};
  
exports.getSpeakingExercises = async (req, res) => {
    const { levelId } = req.params;
  
    try {
      // Query database with LIMIT 5
      const [rows] = await db.query(
        "SELECT prompt_text, translated_text, pronunciation, audio_url, correct_text FROM speaking_exercises WHERE level_id = ? LIMIT 5",
        [levelId]
      );
  
      // Ensure rows is correctly extracted before checking length
      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "No exercises found." });
      }
  
      res.json({ exercises: rows }); // Send the extracted data
    } catch (err) {
      console.error("Error fetching exercises:", err);
      res.status(500).json({ message: "Server error" });
    }
};
  
exports.submitSpeakingAttempt = async (req, res) => {
    try {
      const userId = req.user.id; 
      const { level_id, total_questions, correct_answers, experience_earned, points_earned } = req.body;

      if (
        !level_id || 
        typeof total_questions !== "number" || total_questions <= 0 || 
        typeof correct_answers !== "number" || correct_answers < 0 || 
        typeof experience_earned !== "number" || experience_earned < 0 || 
        typeof points_earned !== "number" || points_earned < 0
      ) {
        return res.status(400).json({ error: "Invalid data provided" });
      }
  
      const accuracy = total_questions > 0 ? (correct_answers / total_questions) * 100 : 0;
  
      await db.query(
        `INSERT INTO speaking_attempts (user_id, level_id, total_questions, correct_answers, accuracy, experience_earned, points_earned) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, level_id, total_questions, correct_answers, accuracy, experience_earned, points_earned]
      );

      const [userProgress] = await db.query(
        "SELECT level, experience, exp_to_next_level, speaking_points FROM user_progress WHERE user_id = ?",
        [userId]
      );
  
      if (!userProgress.length) {
        return res.status(404).json({ error: "User progress not found" });
      }
  
      let { level, experience, exp_to_next_level, speaking_points } = userProgress[0];
  
      experience += experience_earned;
      speaking_points += points_earned;
  
      while (experience >= exp_to_next_level) {
        experience -= exp_to_next_level;
        level += 1; 
        exp_to_next_level = level * 100; 
      }
  
      await db.query(
        "UPDATE user_progress SET level = ?, experience = ?, exp_to_next_level = ?, speaking_points = ? WHERE user_id = ?",
        [level, experience, exp_to_next_level, speaking_points, userId]
      );
  
      res.json({
        message: "🎤 Speaking attempt recorded and experience updated!",
        newLevel: level,
        remainingXP: experience,
        exp_to_next_level,
        updatedSpeakingPoints: speaking_points,
      });
    } catch (error) {
      console.error("🔴 Error updating speaking attempt:", error);
      res.status(500).json({ error: "Server error" });
    }
};