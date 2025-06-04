const db = require('../config/db');

// Fetch quiz questions for a given level
exports.getQuizByLevel = async (req, res) => {
    try {
      const { level } = req.params;
  
      const [questions] = await db.query(
        "SELECT id, question, choices, correct_answer, audio_url FROM quizzes WHERE level_id = ?",
        [level]
      );
  
      if (questions.length === 0) {
        return res.status(404).json({ error: "No questions found for this level" });
      }
  
      const formattedQuestions = questions.map((quiz) => ({
        ...quiz,
        choices: typeof quiz.choices === "string" ? JSON.parse(quiz.choices) : quiz.choices,
      }));
  
      res.json(formattedQuestions);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      res.status(500).json({ error: "Server error" });
    }
};
  
exports.submitQuizAttempt = async (req, res) => {
    try {
      const userId = req.user.id; 
      const { quiz_id, score, experience_earned, points_earned } = req.body;
  
      if (!quiz_id || experience_earned < 0 || points_earned < 0) {
        return res.status(400).json({ error: "Invalid data provided" });
      }
  
      await db.query(
        `INSERT INTO quiz_attempts (user_id, quiz_id, score, experience_earned, points_earned) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, quiz_id, score, experience_earned, points_earned]
      );
  
      const [userProgress] = await db.query(
        "SELECT level, experience, exp_to_next_level, learning_points FROM user_progress WHERE user_id = ?",
        [userId]
      );
  
      if (userProgress.length === 0) {
        return res.status(404).json({ error: "User progress not found" });
      }
  
      let { level, experience, exp_to_next_level, learning_points } = userProgress[0];
      
      experience += experience_earned;
      learning_points += points_earned;
  
      while (experience >= exp_to_next_level) {
        experience -= exp_to_next_level; 
        level += 1; 
        exp_to_next_level = level * 100; 
      }
  
      await db.query(
        "UPDATE user_progress SET level = ?, experience = ?, exp_to_next_level = ?, learning_points = ? WHERE user_id = ?",
        [level, experience, exp_to_next_level, learning_points, userId]
      );
  
      res.json({
        message: "Quiz attempt recorded and experience updated",
        newLevel: level,
        remainingXP: experience,
        exp_to_next_level,
        updatedLearningPoints: learning_points,
      });
    } catch (error) {
      console.error("🔴 Error updating quiz attempt:", error);
      res.status(500).json({ error: "Server error" });
    }
};
  
exports.getQuizzes = async (req, res) => {
    try {
      const [quizzes] = await db.query(`
        SELECT q.id, q.question, q.choices, q.correct_answer, q.audio_url, q.level_id, 
               l.level, l.skill_requirement
        FROM quizzes q
        JOIN quiz_levels l ON q.level_id = l.id
        ORDER BY q.level_id, q.id
      `);
  
      console.log("Raw quizzes from DB:", quizzes); // 🔍 Debugging log
  
      if (!Array.isArray(quizzes)) {
        console.error("Error: quizzes is not an array!", quizzes);
        return res.status(500).json({ error: "Invalid data format from database" });
      }
  
      // Convert choices from JSON string to an array (only if stored as a string)
      const formattedQuizzes = quizzes.map((quiz) => ({
        ...quiz,
        choices: typeof quiz.choices === "string" ? JSON.parse(quiz.choices) : quiz.choices,
      }));
  
      console.log("Formatted quizzes:", formattedQuizzes); // 🔍 Debugging log
  
      res.status(200).json(formattedQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};
  