"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  const auth = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Toggle dropdown visibility
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && event.target.closest(`.${styles.dropdownMenu}`) === null) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className={styles.navbar}>
      <Link href={auth.username ? "/home" : "/"} passHref>
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={150}
          height={50}
          className={styles.logo}
          style={{ cursor: "pointer" }}
        />
      </Link>

      <ul>
        {auth.username ? (
          <>
            <li className={styles.welcomeText}>Welcome, {auth.username}</li>

            {/* Profile Icon with Dropdown */}
            <li className={styles.profileIcon}>
              <Image
                src="/images/profile.png"
                alt="Profile"
                width={40}
                height={40}
                onClick={toggleDropdown}
                style={{ cursor: "pointer" }}
              />
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <ul>
                    <li>
                      <Link href="/about">About Us</Link>
                    </li>
                    <li>
                      <Link href="/feedback">Feedback</Link>
                    </li>
                    {/* ✅ Show "Add Quiz" button if user is an admin */}
                    {auth.is_admin && (
                      <>
                        <li>
                          <Link href="/dashboard">User Dashboard</Link>
                        </li>
                        <li>
                          <Link href="/add-quiz">Add Quiz</Link>
                        </li>
                        <li>
                          <Link href="/delete-quiz">Delete Quiz</Link>
                        </li>
                      </>
                    )}
                    <li>
                      <button className={styles.logout} onClick={auth.logout}>
                        Log out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </li>
          </>
        ) : (
          <>
            <li className={styles.navItem}>
              <Link href="/about">About Us</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/login">Log In</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
