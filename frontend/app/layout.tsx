import type { Metadata } from "next";
import "./styles/globals.css";
import Navbar from "./component/Navbar";
import Footer from "./component/Footer";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "AnnyeongKR",
  description: "Interactive Korean Language Learning Platform with Gamification",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body>
            <Navbar />
            {children}
            <Footer />
        </body>
      </html>
    </AuthProvider>
  );
}
