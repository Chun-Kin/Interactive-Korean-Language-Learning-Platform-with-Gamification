"use client";

import React from "react";
import styles from "../styles/about.module.css";

export default function AboutPage() {
  return (
    <div className={styles.aboutContainer}>
      <div className={styles.aboutCard}>
        <h1 className={styles.aboutTitle}>About Us</h1>

        <p className={styles.aboutDescription}>
          Welcome to our <strong className={styles.highlight}>Interactive Korean Language Learning Platform</strong> – a gamified experience designed to make mastering Korean fun, effective, and engaging!
        </p>

        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>🎯 Our Mission</h2>
          <p className={styles.sectionDescription}>
            We aim to empower learners of all levels by providing an immersive, game-based platform that enhances Korean language skills through quizzes, speaking practice, and reward systems like XP and badges.
          </p>
        </section>

        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>💡 Why Gamification?</h2>
          <p className={styles.sectionDescription}>
            Learning a new language can be tough, but we believe it should be fun too. That’s why our platform includes:
          </p>
          <ul className={styles.featureList}>
            <li>📘 Level-based quizzes for reading & vocabulary</li>
            <li>🎙️ Speaking exercises powered by Google Speech-to-Text</li>
            <li>🏆 Badges, points, and leaderboards to keep you motivated</li>
          </ul>
        </section>

        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>🛠️ How It Works</h2>
          <p className={styles.sectionDescription}>
            Choose your skill level and get started! Whether you’re a complete beginner or looking to polish your fluency, our lessons adapt to your experience. Progress through levels, earn rewards, and track your growth.
          </p>
        </section>

        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>👩‍💻 Developed by</h2>
          <p className={styles.sectionDescription}>
            This platform is proudly developed by a student of <strong>Universiti Tunku Abdul Rahman (UTAR)</strong>, Lee Kong Chian Faculty of Engineering and Science, as part of a Final Year Project.
          </p>
        </section>
      </div>
    </div>
  );
}