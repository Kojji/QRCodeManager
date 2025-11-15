import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { LoginWithEmailAndPassword, SendResetPassword } from "@/routes"
import { User } from "@/routes/schema";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  changePassword: (email: string) => Promise<void>;
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
    return new Promise<void>(async (res, rej) => {
      try {
        const loggedUser = await LoginWithEmailAndPassword(email, password);
        setUser(loggedUser);
        sessionStorage.setItem("qrflow_user", JSON.stringify(loggedUser));
        res();
      } catch(e) {
        rej();
      }
    })

  };

  const changePassword = async (email: string) => {
    return new Promise<void>(async (res, rej) => {
      try {
        await SendResetPassword(email);
        res();
      } catch(e) {
        rej();
      }
    })
  }

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("qrflow_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, isLoading }}>
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
