"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import styles from "../styles/learning.module.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const difficulties = ["No Experience", "Newbie", "Beginner", "Intermediate", "Expert"];
const levelEmojis = [
  "🏯", "🍙", "👤", "🎎", "🌄", 
  "🏠", "🍡", "🧑", "👧", "🏰", 
  "🍜", "👨", "👩", "🏛️", "🍛", 
  "👨", "👩", "🗼", "🍲", "🚀", 
  "👨", "👩", "🎤", "🍣", "🏆"
];


export default function Learning() {
  const auth = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [userProgress, setUserProgress] = useState({ level: 1 });

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/get-user-progress", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUserProgress(data);
        } else {
          console.error("Error fetching progress:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch user progress", err);
      }
    };

    if (auth?.token) fetchUserProgress();
  }, [auth?.token]);

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left" && currentPage < difficulties.length - 1) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "right" && currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleLevelClick = async (level: number, isUnlocked: boolean) => {
    if (!isUnlocked) return;

    try {
        const response = await fetch(`http://localhost:5000/api/auth/get-quizzes-by-level/${level}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${auth?.token}` },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched quizzes:", data); // ✅ Debugging

        // ✅ Adjusted check to match API response format
        if (Array.isArray(data) && data.length > 0) {
            router.push(`/quiz/${level}`);
        } else {
            alert("No quizzes available for this level yet.");
        }
    } catch (err) {
        console.error("Error fetching quizzes:", err);
        alert("Failed to load quizzes. Please try again later.");
    }
};

  
  return (
    <div className={styles.wrapper}>
      {/* Sidebar Navigation */}
      <nav className={styles.sidebar}>
        <ul>
          <li className={styles.navItem}><Link href="/home">🏠 Home</Link></li>
          <li className={styles.navItem}><Link href="/learning">📚 Learning</Link></li>
          <li className={styles.navItem}><Link href="/speaking">🗣️ Speaking</Link></li>
          <li className={styles.navItem}><Link href="/leaderboard">🏆 Leaderboard</Link></li>
          <li className={styles.navItem}><Link href="/badges">🎖️ Badges</Link></li>
        </ul>
      </nav>

      {/* Full-Width Level Container */}
      <div className={styles.container}>
        <h1 className={styles.title}>👨‍🏫 Learning Practice</h1>
        <h1 className={styles.title}>Difficulty - {difficulties[currentPage]}</h1>
        <div className={styles.swipeContainer}>
          <motion.div
            className={styles.levelWrapper}
            key={currentPage}
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.4 }}
          >
            <div className={styles.levels}>
              {[...Array(5)].map((_, j) => {
                const levelNumber = currentPage * 5 + j + 1;
                const isUnlocked = userProgress.level >= levelNumber;
                return (
                  <motion.button
                    key={levelNumber}
                    className={`${styles.level} ${isUnlocked ? styles.unlocked : styles.locked}`}
                    whileHover={{ scale: isUnlocked ? 1.1 : 1 }}
                    disabled={!isUnlocked}
                    onClick={() => handleLevelClick(levelNumber, isUnlocked)}
                  >
                    {levelEmojis[levelNumber - 1]} <br /> {levelNumber}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Swipe Navigation */}
        <div className={styles.pagination}>
          <button onClick={() => handleSwipe("right")} disabled={currentPage === 0}className={styles.navButton}>
            ◀ Prev
          </button>
          <span className={styles.pageIndicator}>{currentPage + 1} / {difficulties.length}</span>
          <button onClick={() => handleSwipe("left")} disabled={currentPage === difficulties.length - 1}className={styles.navButton}>
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}
