"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
  
    setIsSubmitting(true);
    setError("");
  
    try {
      console.log("Attempting to log in...");
  
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
  
      console.log("Response received:", response);
  
      const data = await response.json();
      console.log("Response data:", data);
  
      if (response.ok) {
        auth?.login(data.username, data.token,data.is_admin);
        localStorage.setItem("token", data.token); // Store token for later requests
  
        if (data.has_set_skill_level === 1) {
          router.push("/home");
        } else {
          router.push("/difficulty");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1>Welcome Back!</h1>
      <p style={{ textAlign: "center", maxWidth: "400px" }}>
        Log in to continue your Korean learning journey.
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.loginForm} onSubmit={handleLogin}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" className={styles.loginButton} disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className={styles.signupLink}>
        Don&apos;t have an account?{" "}
        <Link className={styles.signup} href="/register">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
