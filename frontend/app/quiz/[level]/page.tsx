"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import styles from "../../styles/quizPage.module.css"; // For CSS Modules
import Image from "next/image";

export default function QuizPage() {
  const params = useParams();
  const level = parseInt(params?.level as string, 10);
  const router = useRouter();
  const auth = useAuth();

  const [quizzes, setQuizzes] = useState<
    { id: number; question: string; choices: string[]; correct_answer: string; audio_url: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [earnedExp, setEarnedExp] = useState(50 * level);
  const [earnedPoints, setEarnedPoints] = useState(50 * level);

  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(mouseSensor, touchSensor);


  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/auth/get-quizzes-by-level/${level}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${auth?.token}` },
          }
        );
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Fetched quizzes:", data); // ✅ Debugging
  
        // ✅ Fix: API returns an array directly, no need for `data.questions`
        if (!Array.isArray(data) || data.length === 0) {
          alert("No quizzes found for this level.");
          router.push("/learning");
          return;
        }
  
        const shuffleArray = (arr: any[]) =>
          [...arr].sort(() => Math.random() - 0.5);
  
        // 🔁 Shuffle questions & choices
        const randomizedQuizzes = shuffleArray(data).map((quiz: any) => ({
          ...quiz,
          choices: shuffleArray(
            typeof quiz.choices === "string" ? JSON.parse(quiz.choices) : quiz.choices
          ),
        }));
  
        setQuizzes(randomizedQuizzes);
      } catch (err) {
        console.error("Failed to load quizzes:", err);
      } finally {
        setLoading(false);
      }
    };
  
    if (auth?.token) fetchQuizzes();
  }, [auth?.token, level, router]);
  

  // Function to play audio
  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => console.error("Audio playback error:", error));
  };

  // Function to handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return; // No valid drop target

    const draggedChoice = active.id.toString();
    const correctAnswer = quizzes[currentIndex].correct_answer.trim().toLowerCase();

    if (draggedChoice.trim().toLowerCase() === correctAnswer) {
      setFeedback("✅ Correct!");
      setTimeout(() => {
        setFeedback(null);
        if (currentIndex + 1 < quizzes.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          updateUserProgress();
        }
      }, 1000);
    } else {
      setFeedback("❌ Incorrect. Try again!");
    }
  };

  // Function to update EXP and Points
  const updateUserProgress = async () => {
    try {
      const expToEarn = earnedExp;
      const pointsToEarn = earnedPoints;
      const quizScore = quizzes.filter((q) => q.selected_answer === q.correct_answer).length;

      console.log("Submitting Quiz Attempt:", {
        quiz_id: level,
        score: quizScore,
        experience_earned: expToEarn,
        points_earned: pointsToEarn,
      });

      const response = await fetch("http://localhost:5000/api/auth/submit-quiz-attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify({
          quiz_id: level,
          score: quizScore,
          experience_earned: expToEarn,
          points_earned: pointsToEarn,
        }),
      });

      const data = await response.json();
      console.log("Quiz Submission Result:", data);

      if (response.ok) {
        setEarnedExp(expToEarn);
        setEarnedPoints(pointsToEarn);
        setShowCompletionModal(true);
      } else {
        console.error("Failed to submit quiz:", data.error);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const handleCloseModal = () => {
    setShowCompletionModal(false);
    router.push("/learning");
  };

  const handleQuit = () => {
    setShowQuitModal(true);
  };

  const confirmQuit = () => {
    setShowQuitModal(false);
    router.push("/learning"); // Redirect to learning page
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.imageContainer}>
          <Image
            src="/images/kwoman.gif" 
            alt="asset"
            width={250} 
            height={180}
            unoptimized
          />
        </div>
      {/* 🚀 Quit Button Positioned on Top-Right */}
      <button className={styles.quitButton} onClick={handleQuit}>❌ Quit</button>
      <div className={styles.container}>
        <h1 className={styles.quizLevel}>Level {level}</h1>
  
        {loading ? (
          <p>Loading quizzes...</p>
        ) : quizzes.length > 0 ? (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div key={quizzes[currentIndex].id}>
              <h2 className={styles.question}>{quizzes[currentIndex].question}</h2>
              <div className={styles.audioContainer}>
                <button className={styles.audioButton} onClick={() => playAudio(quizzes[currentIndex].audio_url)}>🔊 Play Audio</button>
              </div>
  
              <AnswerBox selectedAnswer={selectedAnswer} />
  
              <ul className={styles.choicesContainer}>
                {quizzes[currentIndex].choices.map((choice, i) => (
                  <li key={i}>
                    <DraggableChoice id={choice} choice={choice} />
                  </li>
                ))}
              </ul>
  
              {feedback && <p>{feedback}</p>}
            </div>
          </DndContext>
        ) : (
          <p>No quizzes available.</p>
        )}
        {showQuitModal && (
          <div className={styles.modalQuit}>
            <div className={styles.modalContent}>
              <h2>⚠ Are you sure?</h2>
              <p>Do you really want to quit the quiz? The progress will not be saved until you complete it.</p>
              <div className={styles.modalButtons}>
                <button onClick={confirmQuit} className={styles.confirmButton}>Yes, Quit</button>
                <button onClick={() => setShowQuitModal(false)} className={styles.cancelButton}>Cancel</button>
              </div>
            </div>
          </div>
        )}
  
        {showCompletionModal && (
          <div className={styles.modal}>
            <h2>🎉 Congratulations!</h2>
            <p>You have completed the quiz!!!</p>
            <p>✨ Earned EXP: <strong>{earnedExp}</strong></p>
            <p>🏆 Earned Points: <strong>{earnedPoints}</strong></p>
            <button onClick={handleCloseModal}>OK</button>
          </div>
        )}
      </div>
    </div>
  );   
}

// 🟢 Draggable Answer Component
function DraggableChoice({ id, choice }: { id: string; choice: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={styles.choiceButton} // Apply styled class
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : "none",
      }}
    >
      {choice}
    </button>
  );
}
// 🟢 Droppable Answer Component
function AnswerBox({ selectedAnswer }: { selectedAnswer: string | null }) {
  const { setNodeRef } = useDroppable({ id: "answer-box" });

  return (
    <div className={styles.answerBoxContainer}>
      <div ref={setNodeRef} className={styles.answerBox}>
        {selectedAnswer || "Drop answer here"}
      </div>
    </div>
  );
}

