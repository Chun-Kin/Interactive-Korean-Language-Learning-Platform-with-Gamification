import styles from '../styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>   
        <p>&copy; {new Date().getFullYear()} AnnyeOngKR. All rights reserved.</p>
      </div>
    </footer>
  );
}