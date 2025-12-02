// src/features/auth/presentation/context/authContext.tsx 
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser } from "../../domain/entities/AuthUser";
import { LoginUseCase } from "../../domain/usecases/LoginUseCase";
import { LogoutUseCase } from "../../domain/usecases/LogoutUseCase";
import { SignupUseCase } from "../../domain/usecases/SignupUseCase";

//Definicion del contexto de autenticacion (datos a compartir)
type AuthContextType = {
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

//Creacion del contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//Proveedor del contexto de autenticacion
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const loginUseCase = di.resolve<LoginUseCase>(TOKENS.LoginUC);
  const signupUseCase = di.resolve<SignupUseCase>(TOKENS.SignupUC);
  const logoutUseCase = di.resolve<LogoutUseCase>(TOKENS.LogoutUC);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    console.log("🚪 [AuthContext] Iniciando app sin sesión activa");
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await loginUseCase.execute(email, password);
    setUser(loggedInUser);
    setIsLoggedIn(true);
  };

  const signup = async (email: string, password: string) => {
    const newUser = await signupUseCase.execute(email, password);
    setUser(newUser);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await logoutUseCase.execute();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

//Hook para usar el contexto de autenticacion
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
