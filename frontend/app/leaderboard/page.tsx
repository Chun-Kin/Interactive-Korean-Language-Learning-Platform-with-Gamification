"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import styles from "../styles/leaderboard.module.css";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState(null); // Start with null to prevent SSR mismatch
  const auth = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/leaderboard", {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        });

        const data = await response.json();
        console.log("API Response:", data); // Debugging: Ensure API data is correct

        if (response.ok) {
            setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
        } else {
          console.error("API Error:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      }
    };

    if (auth?.token) {
      fetchLeaderboard();
    }
  }, [auth?.token]);

  if (leaderboard === null) {
    return <p style={{ height: '60vh' }}>Loading leaderboard...</p>; // Prevents SSR mismatch by delaying rendering
  }

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
        <h1 className={styles.title}>🏆 Leaderboard</h1>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Level</th>
              <th>Total Points</th>
              <th>Learning Points</th>
              <th>Speaking Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length > 0 ? (
              leaderboard.map((user, index) => (
                <tr key={user.id || index}>
                  <td>#{index + 1}</td>
                  <td>{user.username ?? "N/A"}</td>
                  <td>Level {user.level ?? 0}</td>
                  <td>{user.total_points ?? 0} pts</td>
                  <td>{user.learning_points ?? 0} pts</td>
                  <td>{user.speaking_points ?? 0} pts</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No leaderboard data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
