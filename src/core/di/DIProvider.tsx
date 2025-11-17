import { createContext, useContext, useMemo } from "react";
import { container } from "./container";
import { TOKENS } from "./tokens";

import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";

import { GetCurrentUserUseCase } from "@/src/features/auth/domain/usecases/GetCurrentUserUseCase";
import { LoginUseCase } from "@/src/features/auth/domain/usecases/LoginUseCase";
import { LogoutUseCase } from "@/src/features/auth/domain/usecases/LogoutUseCase";
import { SignupUseCase } from "@/src/features/auth/domain/usecases/SignupUseCase";


const DIContext = createContext<typeof container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
  const appContainer = useMemo(() => {
    const c = container;

    // 🔹 Casos de uso de autenticación
    const authRepo = c.resolve<AuthRepositoryImpl>(TOKENS.AuthRepo);
    c.register(TOKENS.LoginUC, new LoginUseCase(authRepo))
      .register(TOKENS.SignupUC, new SignupUseCase(authRepo))
      .register(TOKENS.LogoutUC, new LogoutUseCase(authRepo))
      .register(TOKENS.GetCurrentUserUC, new GetCurrentUserUseCase(authRepo));

    // ✅ Recuperamos el Auth DS actual con tipado seguro
    const authDS = (authRepo as AuthRepositoryImpl)["dataSource"];

    return c;
  }, []);

  return (
    <DIContext.Provider value={appContainer}>
      {children}
    </DIContext.Provider>
  );
}

export function useDI() {
  const c = useContext(DIContext);
  if (!c) throw new Error("DIProvider missing");
  return c;
}

