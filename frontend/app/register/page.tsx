'use client'; // Mark this as a Client Component

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../styles/register.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 
  
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
  
      const data = await response.json();
      console.log("Server Response:", data); 
  
      if (response.ok) {
        console.log("Successfully registered");
        toast.success('Registration successful! Please log in.', {
          position: "top-center",
        });
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error("Fetch error:", err); 
      setError(`Error: ${err.message}`);
    }
  };
  

  useEffect(() => {
    let completedFields = 0;
    if (username) completedFields++;
    if (email) completedFields++;
    if (password) completedFields++;
    setProgress((completedFields / 3) * 100);
  }, [username, email, password]);

  return (
    <div className={styles.registerContainer}>
      <>
        <ToastContainer aria-label="Notification Toasts" />
      </>
      <h1>Join Us!</h1>
      <p>Create an account to start your Korean learning journey.</p>

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.registerForm} onSubmit={handleRegister}>
        <div className={styles.inputGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='Enter your name'
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Enter your email'
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
            placeholder='Enter a strong password'
            required
          />
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: `${progress}%` }}></div>
        </div>
        <button type="submit" className={styles.registerButton}>
          Sign Up
        </button>
      </form>

      <p className={styles.loginLink}>
        Already have an account? <Link className={styles.login} href="/login">Log In</Link>
      </p>
    </div>
  );
}