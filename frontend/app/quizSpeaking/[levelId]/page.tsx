"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/quizSpeaking.module.css";
import Image from "next/image";

export default function QuizSpeaking() {
  const params = useParams();
  const router = useRouter();
  const { levelId } = useParams();
  const level = Number(levelId) || 1;   
  const auth = useAuth();

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<
    { sender: string; text: string; translation?: string; pronunciation?: string; audio?: string }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [earnedExp, setEarnedExp] = useState(50 * level);
  const [earnedPoints, setEarnedPoints] = useState(50 * level);

  let recognition: SpeechRecognition | null = null;

  // 🔄 Fetch exercises on mount
  useEffect(() => {
    if (!auth?.token || !levelId) return;
  
    const fetchExercises = async () => {
      try {
        console.log("🔄 Fetching exercises for level:", levelId);
        const response = await fetch(
          `http://localhost:5000/api/auth/get-speaking-exercises/${levelId}`,
          {
            headers: { Authorization: `Bearer ${auth?.token}` },
          }
        );
  
        if (!response.ok) throw new Error("❌ Failed to fetch");
  
        const data = await response.json();
        console.log("📥 Received data:", data);
  
        if (!data.exercises || data.exercises.length === 0) {
          console.warn("⚠️ No exercises found!");
          return;
        }
        
        const shuffleArray = (array) => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };
        
        // ✅ Flatten nested array
        const flatExercises = data.exercises.flat();
        console.log("🗂 Flattened Exercises:", flatExercises);

        const randomized = shuffleArray(flatExercises);
        console.log("🔀 Shuffled Exercises:", randomized);

        setExercises(randomized);
      } catch (err) {
        console.error("🚨 Error fetching exercises:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchExercises();
  }, [auth?.token, levelId]);

  // ✅ Ensure we select the first exercise correctly
  useEffect(() => {
    if (exercises.length > 0 && currentIndex < exercises.length) {
      console.log("✅ Starting conversation for:", exercises[currentIndex]);
      startConversation(exercises[currentIndex]);
    }
  }, [exercises, currentIndex]);
  

  const startConversation = (exercise) => {
    if (!exercise || typeof exercise !== "object") {
      console.warn("⚠️ Invalid exercise data!", exercise);
      return;
    }

    console.log("🚀 Starting conversation with:", exercise);

    setMessages([
      {
        sender: "bot",
        text: exercise.prompt_text || "⚠️ Missing prompt",
        translation: exercise.translated_text || "⚠️ Missing translation",
        pronunciation: exercise.pronunciation || "⚠️ Missing pronunciation",
        audio: exercise.audio_url || null, 
      },
    ]);
  };

  const playAudio = (audioUrl) => {
    if (!audioUrl) {
      console.warn("⚠️ No audio URL provided!");
      return;
    }

    console.log("🔊 Playing audio:", audioUrl);
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => console.error("Audio playback error:", error));
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
    
      if (!exercises[currentIndex]) {
        console.error("❌ Exercise at index", currentIndex, "is undefined!");
        return;
      }
    
      const correctPronunciation = exercises[currentIndex]?.correct_text || "⚠️ No correct text found!";
      
      console.log("🎤 Recognized Speech:", transcript);
      console.log("📌 Correct Answer from DB:", correctPronunciation);
    
      setMessages((prev) => [...prev, { sender: "user", text: transcript }]);
    
      checkAccuracy(transcript, correctPronunciation);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const normalizeKoreanText = (text) => {
    return text
      .replace(/에요/g, "예요") // Normalize variations
      .trim()
      .toLowerCase();
  };
  
  const checkAccuracy = async (spokenText, correctText) => {
    console.log("🗣 Spoken:", spokenText);
    console.log("✅ Correct:", correctText);
  
    if (!spokenText || !correctText || correctText.includes("⚠️")) {
      console.warn("⚠️ Missing spoken or correct text!");
      return;
    }
  
    const normalizedSpoken = normalizeKoreanText(spokenText);
    const normalizedCorrect = normalizeKoreanText(correctText);
  
    if (normalizedSpoken === normalizedCorrect) {
      setMessages((prev) => [...prev, { sender: "bot", text: "✅ Correct! Well done! 🎉" }]);
  
      if (currentIndex < exercises.length - 1) {
        // ✅ Move to next question normally
        setTimeout(() => {
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }, 2000);
      } else {
        // 🎉 All exercises completed
        console.log("🏆 All exercises completed!");
  
        setTimeout(async () => {
          console.log("📤 Submitting final speaking attempt...");
          
          await handleSpeakingSubmit(); // Save progress to DB ✅
  
          console.log("✅ Submission completed, showing completion modal...");
          setShowCompletionModal(true);
        }, 1500);
      }
    } else {
      setMessages((prev) => [...prev, { sender: "bot", text: "❌ Incorrect! Try again!", pronunciation: correctText }]);
    }
  };  
   
  const handleSpeakingSubmit = async () => {
    try {
      if (!auth?.token) {
        console.warn("⚠️ No auth token, skipping submission.");
        return;
      }
  
      const expToEarn = earnedExp;
      const pointsToEarn = earnedPoints;
      const totalQuestions = 5; // Default total questions
      const correctAnswers = 5; // Example, adjust based on actual results
  
      console.log("📤 Sending speaking attempt...");
      console.log("🔹 Payload:", {
        level_id: level,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        experience_earned: expToEarn,
        points_earned: pointsToEarn,
      });
  
      const response = await fetch("http://localhost:5000/api/auth/submit-speaking-attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          level_id: level,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          experience_earned: expToEarn,
          points_earned: pointsToEarn,
        }),
      });
  
      const data = await response.json();
      console.log("📥 Server response:", data);
  
      if (response.ok) {
        console.log("✅ Submission successful!");
        setEarnedExp(expToEarn);
        setEarnedPoints(pointsToEarn);
      } else {
        console.error("❌ Failed to submit speaking attempt:", data.error);
      }
    } catch (error) {
      console.error("🚨 Error submitting speaking attempt:", error);
    }
  };
  
  
  const handleCloseModal = () => {
    setShowCompletionModal(false);
    router.push("/speaking");
  };

  const handleQuit = () => {
    setShowQuitModal(true);
  };

  const confirmQuit = () => {
    setShowQuitModal(false);
    router.push("/speaking");
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <button className={styles.quitButton} onClick={handleQuit}>❌ Quit</button>
      <h1 className={styles.title}>🗣️ Speaking Practice</h1>
      <div className={styles.chatbox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.sender === "bot" ? styles.botMessage : styles.userMessage
            }
          >
            {msg.sender === "bot" && (
              <Image
                src="/images/robot.png"
                alt="Bot"
                width={40}
                height={40}
              />
            )}
            <div className={styles.textContainer}>
              <p>{msg.text}</p>
              {msg.translation && <p className={styles.translation}>{msg.translation}</p>}
              {msg.pronunciation && <p className={styles.translation}>Pronounce = {msg.pronunciation}</p>}
              {msg.audio && (
                <button 
                  className={styles.playAudioButton} 
                  onClick={() => playAudio(msg.audio)}
                >
                  🔊 Play Audio
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        className={styles.speakButton}
        onClick={startListening}
        disabled={isListening}
        >
        {isListening ? "Listening..." : "🎙️ Speak Now"}
      </button>

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
  );
}
