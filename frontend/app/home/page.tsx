"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/home.module.css";

export default function Home() {
  const [userProgress, setUserProgress] = useState(null);
  const auth = useAuth();

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/get-user-progress", {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserProgress(data);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error("Failed to fetch user progress", err);
      }
    };

    if (auth?.token) {
      fetchUserProgress();
    }
  }, [auth?.token]);

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

      {/* Main Content */}
      <div className={styles.container}>
        {userProgress && (
          <div className={styles.progressWrapper}>
            {/* Skill Level & Experience Container */}
            <div className={styles.skillExpContainer}>
              <p>Level: {userProgress.level}</p>
              <p>Skill Level: {userProgress.skill_level}</p>
              <div className={styles.experienceContainer}>
                <span className={styles.experienceText}>
                  Experience: {userProgress.experience} / {userProgress.experience_needed}
                </span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${(userProgress.experience / userProgress.experience_needed) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Points Section */}
            <div className={styles.pointsContainer}>
              <h2>Total Points - {userProgress.total_points} pts</h2>
              <div className={styles.pointsBoxContainer}>
                <div className={styles.pointsBox}>
                  <h3>Learning Points - {userProgress.learning_points} pts</h3>
                  <button className={styles.continueButton}><Link href='/learning'>🏆 Continue</Link></button>
                </div>
                <div className={styles.pointsBox}>
                  <h3>Speaking Practice - {userProgress.speaking_points} pts</h3>
                  <button className={styles.continueButton}><Link href='/speaking'>🎙️ Continue</Link></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
