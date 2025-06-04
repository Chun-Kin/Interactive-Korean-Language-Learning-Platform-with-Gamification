"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/addQuiz.module.css";

export default function AddQuiz() {
  const router = useRouter();

  const [form, setForm] = useState({
    id: null, // ✅ Change from "" to null
    level_id: "",
    question: "",
    choices: ["", "", "", ""],
    correct_answer: "",
    audio_url: "",
  });

  const [quizzes, setQuizzes] = useState([]); // To fetch quizzes for update mode
  const [isUpdateMode, setIsUpdateMode] = useState(false); // Toggle between add/update
  const [error, setError] = useState("");

  // Fetch all quizzes for the update dropdown
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
        console.log("Fetched Quizzes in Frontend:", data);
  
        // Fix: Directly check if 'data' is an array
        if (Array.isArray(data)) {
          setQuizzes(data); // Use 'data' directly instead of 'data.data'
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

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle choice changes
  const handleChoiceChange = (index: number, value: string) => {
    const updatedChoices = [...form.choices];
    updatedChoices[index] = value;
    setForm({ ...form, choices: updatedChoices });
  };

  // Handle quiz selection for update mode
  const handleQuizSelect = (quizId: string) => {
    const selectedQuiz = quizzes.find((quiz) => quiz.id === Number(quizId));
    if (selectedQuiz) {
      let parsedChoices = selectedQuiz.choices;
  
      // ✅ Ensure choices are parsed properly
      if (typeof parsedChoices === "string") {
        try {
          parsedChoices = JSON.parse(parsedChoices);
        } catch (error) {
          console.error("Invalid JSON format in choices:", selectedQuiz.choices);
          parsedChoices = ["", "", "", ""]; // Default empty choices
        }
      }
  
      // ✅ Fix: Use `new_question` instead of `question`
      setForm({
        id: selectedQuiz.id,
        question: selectedQuiz.question || "", // ✅ Ensure it's not undefined
        choices: parsedChoices,
        correct_answer: selectedQuiz.correct_answer,
        audio_url: selectedQuiz.audio_url,
        level_id: String(selectedQuiz.level_id), // Convert to string for `<select>`
      });
    }
  };  

  // Handle form submission (add or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }
  
    // ✅ Add `id` only in update mode
    const quizData = {
      ...(isUpdateMode && { id: form.id }), // Include `id` only if updating
      question: form.question.trim(),
      choices: form.choices,
      correct_answer: form.correct_answer,
      audio_url: form.audio_url,
      level_id: Number(form.level_id),
    };
  
    console.log("🚀 Sending quizData:", quizData); // Debugging
  
    try {
      const url = isUpdateMode
        ? `http://localhost:5000/api/auth/update-quiz`
        : "http://localhost:5000/api/auth/add-quiz";
  
      const method = isUpdateMode ? "PUT" : "POST";
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quizData),
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }
  
      alert(isUpdateMode ? "Quiz updated successfully!" : "Quiz added successfully!");
      router.refresh(); // Refresh the page to reflect changes
  
    } catch (err: any) {
      setError(err.message);
    }
  };
  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{isUpdateMode ? "Update Quiz" : "Add a New Quiz"}</h1>

      {error && <p className={styles.error}>{error}</p>}

      {/* Toggle between Add and Update mode */}
      <button
        className={styles.button}
        onClick={() => setIsUpdateMode(!isUpdateMode)}
        style={{ marginBottom: "20px" }}
      >
        {isUpdateMode ? "Switch to Add Mode" : "Switch to Update Mode"}
      </button>

      {/* Quiz selection dropdown for update mode */}
      {isUpdateMode && (
        <div>
          <label className={styles.label}>Select Quiz to Update:</label>
          <select
            className={styles.select}
            onChange={(e) => handleQuizSelect(e.target.value)}
            required
          >
            <option value="">Select a Quiz</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id} className={styles.option}>
                {quiz.question}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quiz form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>Question:</label>
        <input
          className={styles.input}
          type="text"
          name="question"
          value={form.question}
          onChange={handleChange}
          required
        />

        <label className={styles.label}>Choices:</label>
        <div className={styles.choicesContainer}>
          {form.choices.map((choice, index) => (
            <input
              key={index}
              type="text"
              className={styles.input}
              placeholder={`Choice ${index + 1}`}
              value={choice}
              onChange={(e) => handleChoiceChange(index, e.target.value)}
              required
            />
          ))}
        </div>

        <label className={styles.label}>Correct Answer:</label>
        <input
          className={styles.input}
          type="text"
          name="correct_answer"
          value={form.correct_answer}
          onChange={handleChange}
          required
        />

        <label className={styles.label}>Audio URL:</label>
        <input
          className={styles.input}
          type="text"
          name="audio_url"
          value={form.audio_url}
          onChange={handleChange}
          placeholder="http://localhost:5000/audio/giyeok.mp3"
        />

        <label className={styles.label}>Level ID:</label>
        <select
          className={styles.select}
          name="level_id"
          value={form.level_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Level</option>
          {[...Array(25)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Level {i + 1}
            </option>
          ))}
        </select>

        <button className={styles.button} type="submit">
          {isUpdateMode ? "Update Quiz" : "Add Quiz"}
        </button>
      </form>
    </div>
  );
}