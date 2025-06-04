"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/speaking.module.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Speaking() {
  const auth = useAuth();
  const router = useRouter();
  const [speakingLevels, setSpeakingLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const skillGroupsPerPage = 1; // Show 1 skill group at a time

  useEffect(() => {
    const fetchSpeakingLevels = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/get-speaking-levels", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setSpeakingLevels(data.levels);
        } else {
          console.error("Error fetching speaking levels:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch speaking levels", err);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) fetchSpeakingLevels();
  }, [auth?.token]);

  const handleLevelClick = (levelId: number, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    router.push(`/quizSpeaking/${levelId}`);
  };

  // Group levels by skill requirement
  const groupedLevels = speakingLevels.reduce((acc, level) => {
    if (!acc[level.skill_requirement]) {
      acc[level.skill_requirement] = [];
    }
    acc[level.skill_requirement].push(level);
    return acc;
  }, {});

  // Convert grouped object to an array of skill groups
  const skillGroupKeys = Object.keys(groupedLevels);
  const totalPages = Math.ceil(skillGroupKeys.length / skillGroupsPerPage);

  // Get the skill groups for the current page
  const visibleSkillGroups = skillGroupKeys.slice(
    currentPage * skillGroupsPerPage,
    (currentPage + 1) * skillGroupsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

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

      {/* Speaking Levels Section */}
      <div className={styles.container}>
        <h1 className={styles.title}>🗣️ Speaking Practice</h1>
        <p className={styles.description}>Practice speaking Korean with interactive exercises.</p>

        {/* Display Only 1 Skill Group Per Page */}
        {visibleSkillGroups.map((skill) => (
          <div key={skill} className={styles.skillGroup}>
            <h2 className={styles.skillTitle}>{skill.toUpperCase()}</h2>
            <div className={styles.levelGrid}>
              {groupedLevels[skill].map((level) => (
                <motion.button
                  key={level.id}
                  className={`${styles.level} ${level.isUnlocked ? styles.unlocked : styles.locked}`}
                  whileHover={{ scale: level.isUnlocked ? 1.05 : 1 }}
                  disabled={!level.isUnlocked}
                  onClick={() => handleLevelClick(level.id, level.isUnlocked)}
                >
                  <Image
                    src={level.image_url}
                    alt={level.title}
                    width={200} // Bigger image
                    height={200}
                    className={styles.levelImage}
                    priority
                  />
                  <span className={styles.levelTitle}>{level.title}</span>
                  <p className={styles.levelDescription}>{level.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ))}

        {/* Pagination Controls */}
        <div className={styles.pagination}>
          <button onClick={handlePrevious} disabled={currentPage === 0} className={styles.navButton}>
          ◀ Prev
          </button>
          <span className={styles.pageIndicator}>{currentPage + 1} / {totalPages}</span>
          <button onClick={handleNext} disabled={currentPage === totalPages - 1} className={styles.navButton}>
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}
