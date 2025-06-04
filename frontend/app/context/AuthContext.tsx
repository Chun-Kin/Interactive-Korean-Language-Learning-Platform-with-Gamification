"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  username: string | null;
  token: string | null;
  is_admin: boolean; // ✅ Add admin status
  login: (username: string, token: string, is_admin: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // ✅ Admin state
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedIsAdmin = localStorage.getItem("is_admin");

    if (storedUsername && storedToken) {
      setUsername(storedUsername);
      setToken(storedToken);
      setIsAdmin(storedIsAdmin === "true"); // ✅ Convert to boolean
    }
  }, []);

  const login = (username: string, token: string, is_admin: boolean) => {
    localStorage.setItem("user", username);
    localStorage.setItem("token", token);
    localStorage.setItem("is_admin", String(is_admin)); // ✅ Store as string
    setUsername(username);
    setToken(token);
    setIsAdmin(is_admin);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    setUsername(null);
    setToken(null);
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ username, token, is_admin: isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
