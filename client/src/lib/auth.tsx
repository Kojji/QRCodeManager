import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("qrflow_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        sessionStorage.removeItem("qrflow_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, name?: string) => {
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email,
      password: "",
      name: name || email.split("@")[0],
    };
    
    setUser(mockUser);
    sessionStorage.setItem("qrflow_user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("qrflow_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
