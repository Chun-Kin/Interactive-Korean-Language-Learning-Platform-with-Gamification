const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password, has_set_skill_level) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(sql, [username, email, hashedPassword, 0]);

    if (result.affectedRows === 1) {
      res.status(201).json({ message: 'User registered successfully' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  } catch (error) {
    console.error("🔴 Registration error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🟡 Login attempt:", email);

    const sql = 'SELECT * FROM users WHERE email = ?';
    const [result] = await db.execute(sql, [email]);

    if (result.length === 0) {
      return res.status(400).json({ error: 'Email not found' });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      token,
      username: user.username,
      has_set_skill_level: user.has_set_skill_level,
      is_admin: !!user.is_admin 
    });
  } catch (error) {
    console.error("🔴 Login error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Set user skill level
exports.setSkillLevel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill_level } = req.body;

    const levelRanges = {
      "no-experience": { min: 1, max: 5 },
      "newbie": { min: 6, max: 10 },
      "beginner": { min: 11, max: 15 },
      "intermediate": { min: 16, max: 20 },
      "expert": { min: 21, max: 25 } 
    };

    const { min: startingLevel, max: maxLevel } = levelRanges[skill_level] || levelRanges["no-experience"];

    const expToNextLevel = startingLevel * 100; 

    await db.query(
      "UPDATE users SET has_set_skill_level = 1, skill_level = ? WHERE id = ?",
      [skill_level, userId]
    );

    await db.query(
      `INSERT INTO user_progress (user_id, level, experience, exp_to_next_level) 
       VALUES (?, ?, 0, ?) 
       ON DUPLICATE KEY UPDATE level = ?, exp_to_next_level = ?`,
      [userId, startingLevel, expToNextLevel, startingLevel, expToNextLevel]
    );

    res.json({ 
      success: true, 
      message: "Skill level set successfully", 
      level: startingLevel,
      max_level: maxLevel,
      exp_to_next_level: expToNextLevel 
    });

  } catch (error) {
    console.error("Error setting skill level:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await db.query(
      "SELECT skill_level FROM users WHERE id = ?",
      [userId]
    );

    const [progress] = await db.query(
      "SELECT level, experience, learning_points, speaking_points FROM user_progress WHERE user_id = ?",
      [userId]
    );

    if (!user.length || !progress.length) {
      return res.status(404).json({ error: "User progress not found" });
    }

    const userData = {
      skill_level: user[0].skill_level,
      level: progress[0].level,
      experience: progress[0].experience,
      experience_needed: progress[0].level * 100, 
      learning_points: progress[0].learning_points,
      speaking_points: progress[0].speaking_points,
      total_points: progress[0].learning_points + progress[0].speaking_points,
    };

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const [leaderboard] = await db.query(`
      SELECT u.id, u.username, up.level, 
             (up.learning_points + up.speaking_points) AS total_points,
             up.learning_points, up.speaking_points
      FROM user_progress up
      JOIN users u ON up.user_id = u.id
      ORDER BY total_points DESC
      LIMIT 10;
    `);

    console.log("Leaderboard Data from DB:", leaderboard); 

    res.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, feedback, rating } = req.body;

    if (!name || !email || !feedback || rating === undefined) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const query = `
      INSERT INTO feedback (name, email, feedback, rating, user_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(query, [name, email, feedback, rating, userId]);

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully.',
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Server error' });
  }
};