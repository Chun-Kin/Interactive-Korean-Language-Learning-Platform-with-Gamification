import Image from "next/image";
//import Link from "next/link";
import styles from './styles/page.module.css';

export default function Home() {
  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <h1>Don&apos;t know where to learn Korean? <br />You have come the right place!</h1>
        <div className={styles.lessonContainer}>
          <Image
            src="/images/lesson-example.png"
            alt="lesson"
            width={800} // Set the width
            height={500} // Set the height
            className={styles.lessonImage}
          />
        </div>
        <h1>Become a Korean expert from now!</h1>
        <button className={styles.button}><a href="/login">Start Learning Now</a></button>
      </div>
      <section className={styles.introSection}>
        <article className={styles.textBlock}>
          <h1>Dive into Korean Culture</h1>
          <p>Learn Korean to connect with your favorite celebrities and explore Korean traditions.</p>
        </article>
        <div className={styles.introImage}>
          <Image
            src="/images/iu.png"
            alt="Korean culture"
            width={300}
            height={500}
          />
          <Image
            src="/images/structure.png"
            alt="Korean culture"
            width={300}
            height={500}
          />
          <Image
            src="/images/food.jpg"
            alt="Korean culture"
            width={300}
            height={500}
          />
        </div>
      </section>

      <section className={styles.cultureSection}>
        <div className={styles.imageBlock}>
          <Image
            src="/images/quiz.gif"
            alt="Interactive quiz"
            width={600}
            height={500}
            unoptimized
          />
        </div>
        <article className={styles.textBlock}>
          <h1>Learn Through Interactive Quizzes</h1>
          <p>Engage with fun quizzes that test your knowledge while keeping the learning experience exciting.</p>
        </article>
      </section>

      <section className={styles.speakingSection}>
        <article className={styles.textBlock}>
          <h1>Practice Speaking Like a Native</h1>
          <p>Improve your Korean speaking skills with guided exercises and real-world scenarios.</p>
        </article>
        <div className={styles.imageBlock}>
          <Image
            src="/images/speak.gif"
            alt="Speaking lesson"
            width={600}
            height={500}
            unoptimized
          />
        </div>
      </section>
    </div>
  );
}