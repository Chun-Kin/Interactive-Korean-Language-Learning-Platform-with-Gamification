'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/difficulty.module.css';

export default function Difficulty() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Prevents multiple clicks
  const auth = useAuth();

  // Handles user level selection
  const handleLevelSelection = (level: string) => {
    setSelectedLevel(level);
    setError(''); // Clear previous errors
  };

  // Handles submitting the selected skill level
  const handleSubmit = async () => {
    if (!selectedLevel) {
      setError('Please select a difficulty level.');
      return;
    }

    const token = auth?.token || localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }

    setLoading(true); // Disable multiple clicks

    try {
      const response = await fetch("http://localhost:5000/api/auth/set-skill-level", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skill_level: selectedLevel, // Send only skill_level, backend maps to ranges
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Skill level set successfully:", data); // Debugging
        router.push('/home'); // Redirect after setting skill level
      } else {
        setError(data.error || 'Failed to save skill level.');
      }
    } catch (err) {
      console.error('Error submitting skill level:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>What&apos;s Your Korean Skill Level?</h1>
      <p>Choose your level to get started with personalized learning content.</p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.levels}>
        {Object.entries({
          'no-experience': 'No Experience',
          'newbie': 'Newbie',
          'beginner': 'Beginner',
          'intermediate': 'Intermediate',
          'expert': 'Expert',
        }).map(([level, title]) => (
          <div
            key={level}
            className={`${styles.levelCard} ${selectedLevel === level ? styles.selected : ''}`}
            onClick={() => handleLevelSelection(level)}
          >
            <h2>{title}</h2>
            <p>
              {level === 'no-experience' && "Never learned Korean before? Start from scratch!"}
              {level === 'newbie' && "Know a few words or phrases? Build a stronger foundation."}
              {level === 'beginner' && "Comfortable with basic Korean? Expand your vocabulary and grammar."}
              {level === 'intermediate' && "Can hold simple conversations? Learn more complex sentences and expressions."}
              {level === 'expert' && "Already fluent? Master advanced grammar, idioms, and cultural nuances."}
            </p>
          </div>
        ))}
      </div>

      <button className={styles.submitButton} onClick={handleSubmit} disabled={loading}>
        {loading ? 'Setting Up...' : 'Start Learning'}
      </button>
    </div>
  );
}
