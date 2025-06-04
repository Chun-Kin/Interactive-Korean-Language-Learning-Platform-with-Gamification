"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/badges.module.css";

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/user-badges", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}` // Ensure user is authenticated
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch badges");

        const data = await response.json();
        setBadges(data);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

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

      {/* Badge Display Section */}
      <div className={styles.badgeContainer}>
        <h1 className={styles.title}>Your Badges</h1>

        {loading ? (
          <p>Loading badges...</p>
        ) : (
          <div className={styles.grid}>
            {badges.length > 0 ? (
              badges.map((badge) => (
                <div key={badge.id} className={styles.badgeItem}>
                  <Image
                    src={badge.icon_url}
                    alt={badge.name}
                    width={100}
                    height={100}
                    className={`${styles.badgeImage} ${badge.earned ? "" : styles.locked}`}
                  />
                  <p className={styles.badgeText}>{badge.name}</p>
                </div>
              ))
            ) : (
              <p>No badges earned yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
