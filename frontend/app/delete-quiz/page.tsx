"use client";

import { useState, useEffect } from "react";
import styles from "../styles/deleteQuiz.module.css"; 

export default function DeleteQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch all quizzes for the delete dropdown
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, user might be logged out.");
          return;
        }

        const response = await fetch("http://localhost:5000/api/auth/quizzes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log("Fetched Quizzes:", data);

        if (Array.isArray(data)) {
          setQuizzes(data);
        } else {
          console.error("Unexpected API response format:", data);
          setQuizzes([]);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setQuizzes([]);
      }
    };

    fetchQuizzes();
  }, []);

  // Handle quiz selection
  const handleQuizSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuizId(e.target.value);
    setError("");
    setSuccess("");
  };

  // Handle quiz deletion
const handleDelete = async () => {
  if (!selectedQuizId) {
    setError("Please select a quiz to delete");
    return;
  }
  setShowModal(true); // 🆕 Show the confirmation modal
};

// Confirm delete when user clicks "Yes"
const confirmDelete = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      `http://localhost:5000/api/auth/delete-quiz/${selectedQuizId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete quiz");
    }

    setSuccess("Quiz deleted successfully!");
    setQuizzes(quizzes.filter((quiz) => quiz.id !== Number(selectedQuizId)));
    setSelectedQuizId("");
    setShowModal(false); // Close modal after success ✅
  } catch (err: any) {
    console.error("Full delete error:", err);
    setError(
      err.message.includes("<!DOCTYPE")
        ? "Server route not found (404)"
        : err.message
    );
    setShowModal(false); // Close modal even if error
  }
};

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Delete Quiz</h1>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <div>
        <label className={styles.label}>Select Quiz to Delete:</label>
        <select
          className={styles.select}
          value={selectedQuizId}
          onChange={handleQuizSelect}
          required
        >
          <option value="">Select a Quiz</option>
          {quizzes.map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.question} (Level {quiz.level_id})
            </option>
          ))}
        </select>
      </div>

      {selectedQuizId && (
        <div className={styles.preview}>
          <h3>Selected Quiz Preview:</h3>
          <p>
            <strong>Question:</strong>{" "}
            {quizzes.find((q) => q.id === Number(selectedQuizId))?.question}
          </p>
          <p>
            <strong>Correct Answer:</strong>{" "}
            {
              quizzes.find((q) => q.id === Number(selectedQuizId))
                ?.correct_answer
            }
          </p>
        </div>
      )}

      <button
        className={`${styles.button} ${styles.deleteButton}`}
        onClick={handleDelete}
        disabled={!selectedQuizId}
      >
        Delete Quiz
      </button>

      {showModal && (
      <div className={styles.modalDelete}>
        <div className={styles.modalDeleteContent}>
          <h2>Confirm Deletion</h2>
          <p>Are you sure you want to delete this quiz?</p>
          <button onClick={confirmDelete} className={styles.modalDeleteButton}>
            Yes, Delete
          </button>
          <button onClick={() => setShowModal(false)} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    )}
    </div>
  );
}