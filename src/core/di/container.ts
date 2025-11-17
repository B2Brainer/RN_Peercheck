import { AuthLocalDataSourceImpl } from "@/src/features/auth/data/datasources/AuthLocalDataSourceImpl";
import { AuthRemoteDataSourceAdapter } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceAdapter";
import { IAuthDataSource } from "@/src/features/auth/data/datasources/iAuthDataSource";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { TOKENS } from "./tokens";

// Simple Dependency Injection Container
export class Container {
  private singletons = new Map<symbol, unknown>();

  register<T>(token: symbol, instance: T) {
    this.singletons.set(token, instance);
    return this;
  }

  resolve<T>(token: symbol): T {
    const v = this.singletons.get(token);
    if (!v) throw new Error(`No provider for ${String(token)}`);
    return v as T;
  }
}

// 🔧 Usa variable de entorno o fallback manual
const USE_LOCAL =
  process.env.EXPO_PUBLIC_USE_LOCAL_AUTH === "true" || false; // default: remoto

let authDS: IAuthDataSource;

// 🔹 Decide automáticamente el origen de datos
if (USE_LOCAL) {
  authDS = new AuthLocalDataSourceImpl();
  console.log("[Auth DS] ✅ Usando modo LOCAL (AsyncStorage)");
} else {
  authDS = new AuthRemoteDataSourceAdapter();
  console.log("[Auth DS] 🌐 Usando modo REMOTO (ROBLE API)");
}

export const container = new Container();
container.register(TOKENS.AuthRepo, new AuthRepositoryImpl(authDS));
