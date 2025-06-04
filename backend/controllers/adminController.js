const db = require('../config/db');

exports.addQuiz = async (req, res) => {
    try {
      const { question, choices, correct_answer, audio_url, level_id } = req.body;
  
      console.log("📩 Received Data:", req.body);
  
      if (!question || !choices || !correct_answer || !audio_url || !level_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const level = parseInt(level_id, 10);
      if (isNaN(level)) {
        return res.status(400).json({ error: "Invalid level_id" });
      }
  
      let skillRequirement;
      if (level <= 5) {
        skillRequirement = "no-experience";
      } else if (level <= 10) {
        skillRequirement = "newbie";
      } else if (level <= 15) {
        skillRequirement = "beginner";
      } else if (level <= 20) {
        skillRequirement = "intermediate";
      } else {
        skillRequirement = "expert";
      }
  
      const expRequired = level * 100;
  
      const [existingLevel] = await db.query(
        "SELECT id FROM quiz_levels WHERE id = ?",
        [level]
      );
  
      if (existingLevel.length === 0) {
        await db.query(
          "INSERT INTO quiz_levels (id, level, skill_requirement, exp_required) VALUES (?, ?, ?, ?)",
          [level, level, skillRequirement, expRequired]
        );
      }
  
      console.log("📌 Inserting Quiz:", {
        question,
        choices,
        correct_answer,
        audio_url,
        level,
      });
  
      await db.query(
        "INSERT INTO quizzes (question, choices, correct_answer, audio_url, level_id) VALUES (?, ?, ?, ?, ?)",
        [question, JSON.stringify(choices), correct_answer, audio_url, level]
      );
  
      res.status(201).json({ message: "Quiz added successfully!" });
    } catch (error) {
      console.error("❌ Error adding quiz:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
exports.updateQuiz = async (req, res) => {
    try {
        console.log("Request body:", req.body); 
  
        const { id, level_id, question, choices, correct_answer, audio_url } = req.body;
  
        if (!id || !question || !choices || !correct_answer || !audio_url || !level_id) {
            return res.status(400).json({ error: "All fields are required." });
        }
  
        const [quiz] = await db.query("SELECT * FROM quizzes WHERE id = ?", [id]);
  
        if (!quiz || quiz.length === 0) {
            return res.status(404).json({ success: false, error: "Quiz not found." });
        }
  
        await db.query(
          "UPDATE quizzes SET question = ?, choices = ?, correct_answer = ?, audio_url = ?, level_id = ? WHERE id = ?",
          [question, JSON.stringify(choices), correct_answer, audio_url, level_id, id] 
        );    
  
        res.json({ success: true, message: "Quiz updated successfully!" });
  
    } catch (error) {
        console.error("Error updating quiz:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
  
exports.deleteQuiz = async (req, res) => {
    const { id } = req.params; 
    try {
      const result = await db.query("DELETE FROM quizzes WHERE id = ?", [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      console.log("🧨 Deleting quiz ID:", id);
      res.json({ message: "Quiz deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ message: "Server error while deleting quiz" });
    }
};

exports.getAllUsersWithProgress = async (req, res) => {
    try {
      const [results] = await db.query(`
        SELECT 
          u.id,
          u.username,
          u.email,
          u.skill_level,
          up.level,
          up.experience,
          up.exp_to_next_level,
          up.learning_points,
          up.speaking_points
        FROM users u
        LEFT JOIN user_progress up ON u.id = up.user_id
      `);
  
      res.json({ success: true, users: results });
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Server error" });
    }
  };
  
  exports.updateUserInfo = async (req, res) => {
    const userId = req.params.id;
    const {
      username,
      email,
      skill_level,
      level,
      experience,
      exp_to_next_level,
      learning_points,
      speaking_points
    } = req.body;
  
    try {
      await db.query(`
        UPDATE users 
        SET username = ?, email = ?, skill_level = ?
        WHERE id = ?
      `, [username, email, skill_level, userId]);

      await db.query(`
        UPDATE user_progress 
        SET level = ?, experience = ?, exp_to_next_level = ?, learning_points = ?, speaking_points = ?
        WHERE user_id = ?
      `, [level, experience, exp_to_next_level, learning_points, speaking_points, userId]);
  
      res.json({ success: true, message: "User info updated successfully" });
    } catch (err) {
      console.error("🔴 Error updating user info:", err);
      res.status(500).json({ success: false, error: "Failed to update user info" });
    }
};
  
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    await db.query(`DELETE FROM quiz_attempts WHERE user_id = ?`, [userId]);
    await db.query(`DELETE FROM speaking_attempts WHERE user_id = ?`, [userId]);
    await db.query(`DELETE FROM user_badges WHERE user_id = ?`, [userId]);
    await db.query(`DELETE FROM user_progress WHERE user_id = ?`, [userId]);

    await db.query(`DELETE FROM users WHERE id = ?`, [userId]);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("🔴 Error deleting user:", err);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
};
