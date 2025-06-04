const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const quizController = require('../controllers/quizController');
const speakController = require('../controllers/speakController');
const badgeController = require('../controllers/badgeController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const authenticateAdmin = require('../middleware/adminMiddleware');

const router = express.Router();
// Authentication Routes
router.post('/register', authController.register);
router.post("/login", (req, res) => {
    console.log("🟡 Received request body:", req.body);
    authController.login(req, res);
});
router.post('/set-skill-level', authenticateToken, authController.setSkillLevel);
router.get('/get-user-progress', authenticateToken, authController.getUserProgress);
router.get('/leaderboard', authenticateToken, authController.getLeaderboard);

// Admin Quiz Management Routes
router.post('/add-quiz', authenticateAdmin, adminController.addQuiz);
router.put('/update-quiz', authenticateAdmin, adminController.updateQuiz);  
router.delete('/delete-quiz/:id', authenticateAdmin, adminController.deleteQuiz);

// User Management (Admin Only)
router.get('/dashboard', authenticateToken, requireAdmin, adminController.getAllUsersWithProgress);
router.put('/users/:id', authenticateToken, requireAdmin, adminController.updateUserInfo);
router.delete('/users/:id', authenticateToken, requireAdmin, adminController.deleteUser);

// Feedback 
router.post('/feedback', authenticateToken, authController.submitFeedback);

// Quiz Routes
router.get('/get-quizzes-by-level/:level', authenticateToken, quizController.getQuizByLevel);
router.get("/quizzes", authenticateToken, quizController.getQuizzes);
router.post('/submit-quiz-attempt', authenticateToken, quizController.submitQuizAttempt);

// Speaking Practice Routes
router.get("/get-speaking-levels", authenticateToken, speakController.getSpeakingLevels);
router.get("/get-speaking-exercises/:levelId", authenticateToken, speakController.getSpeakingExercises);
router.post("/submit-speaking-attempt", authenticateToken, speakController.submitSpeakingAttempt);

// Badges & Awards
router.get("/check-award-badges", authenticateToken, badgeController.checkAndAwardBadges);
router.get("/user-badges", authenticateToken, badgeController.getUserBadges);

module.exports = router;