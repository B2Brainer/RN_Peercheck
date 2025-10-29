import { AuthLocalDataSourceImpl } from "@/src/features/auth/data/datasources/AuthLocalDataSourceImpl";
import { AuthRemoteDataSourceAdapter } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceAdapter";
import { IAuthDataSource } from "@/src/features/auth/data/datasources/iAuthDataSource";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { TOKENS } from "./tokens";

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

// 🧭 Cambia esta bandera para alternar entre local y Roble
const USE_LOCAL = true; // true = local | false = Roble API

let authDS: IAuthDataSource;

// 🔹 Garantizamos que siempre haya un getCurrentUser válido
if (USE_LOCAL) {
  authDS = new AuthLocalDataSourceImpl();
  console.log("[Auth DS] Usando modo LOCAL (AsyncStorage)");
} else {
  authDS = new AuthRemoteDataSourceAdapter();
  console.log("[Auth DS] Usando modo REMOTO (Roble + Adapter)");
}

export const container = new Container();
container.register(TOKENS.AuthRepo, new AuthRepositoryImpl(authDS));


