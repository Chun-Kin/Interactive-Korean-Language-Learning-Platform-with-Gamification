const db = require('../config/db');

exports.checkAndAwardBadges = async (userId) => {
    try {
        const [progressResult] = await db.query(`
            SELECT level, learning_points, speaking_points FROM user_progress WHERE user_id = ?
        `, [userId]);
  
        if (!progressResult.length) return;
  
        const { level, learning_points, speaking_points } = progressResult[0]; 
        const totalPoints = learning_points + speaking_points;
        const earnedBadges = [];
  
        for (let lvl = 5; lvl <= 20; lvl += 5) {
            const badgeName = `Level ${lvl} Achiever`;
            if (level >= lvl) {
                earnedBadges.push(badgeName);
            }
        }
  
        for (let pts = 500; pts <= 2000; pts += 500) {
            const badgeName = `${pts} Points Earned`;
            if (totalPoints >= pts) {  
                earnedBadges.push(badgeName);
            }
        }

        const [leaderboard] = await db.query(`
            SELECT user_id, RANK() OVER (ORDER BY (learning_points + speaking_points) DESC) AS ranking FROM user_progress
        `);
  
        const userRank = leaderboard.find(row => row.user_id === userId)?.ranking || null;
        if (userRank === 1) earnedBadges.push("Leaderboard Champion");
        if (userRank === 2) earnedBadges.push("Leaderboard Runner-up");
        if (userRank === 3) earnedBadges.push("Leaderboard Top 3");
  
        for (const badgeName of earnedBadges) {
            const [existing] = await db.query(`
                SELECT id FROM user_badges WHERE user_id = ? AND badge_id = (SELECT id FROM badges WHERE name = ?)
            `, [userId, badgeName]);
  
            if (existing.length === 0) {  
                await db.query(`
                    INSERT INTO user_badges (user_id, badge_id)
                    VALUES (?, (SELECT id FROM badges WHERE name = ?))
                `, [userId, badgeName]);
            }
        }
  
    } catch (error) {
        console.error("Error checking badges:", error);
    }
};
  
exports.getUserBadges = async (req, res) => {
    try {
        const userId = req.user.id;
  
        await exports.checkAndAwardBadges(userId);
  
        const [allBadges] = await db.query(`SELECT id, name, icon_url FROM badges`);
        const [userBadges] = await db.query(`
            SELECT badge_id FROM user_badges WHERE user_id = ?
        `, [userId]);
  
        const earnedBadgeIds = userBadges.map(badge => badge.badge_id);
        
        const badgesWithStatus = allBadges.map(badge => ({
            ...badge,
            earned: earnedBadgeIds.includes(badge.id),
        }));
  
        res.json(badgesWithStatus);
    } catch (error) {
        console.error("Error fetching user badges:", error);
        res.status(500).json({ error: "Failed to fetch user badges" });
    }
};