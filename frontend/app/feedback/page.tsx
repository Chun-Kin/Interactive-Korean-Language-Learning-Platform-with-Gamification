"use client";

import { useState } from "react";
import styles from "../styles/feedback.module.css";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback || !name || !email) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name, email, feedback, rating }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSuccessMessage("Thank you for your feedback!");
      setFeedback("");
      setName("");
      setEmail("");
      setRating(5);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage("An error occurred while submitting your feedback.");
    }
  };

  return (
    <div className={styles.feedbackContainer}>
      <h1 className={styles.feedbackTitle}>We Value Your Feedback</h1>

      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

      <form className={styles.feedbackForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.formInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.formInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="rating">Rating:</label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className={styles.formSelect}
            required
          >
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="feedback">Your Feedback:</label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className={styles.formTextarea}
            required
            placeholder="Share your thoughts..."
          />
        </div>

        <button type="submit" className={styles.submitButton}>Submit Feedback</button>
      </form>
    </div>
  );
}