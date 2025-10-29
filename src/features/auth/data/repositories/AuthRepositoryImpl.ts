import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { IAuthDataSource } from "../datasources/iAuthDataSource";

export class AuthRepositoryImpl implements AuthRepository {
  private dataSource: IAuthDataSource;

  constructor(dataSource: IAuthDataSource) {
    this.dataSource = dataSource;
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const user = await this.dataSource.login(email, password);
    console.log("✅ [AuthRepositoryImpl] Usuario logueado:", user);
    return user;
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    const user = await this.dataSource.signup(email, password);
    console.log("✅ [AuthRepositoryImpl] Usuario registrado:", user);
    return user;
  }

  async logout(): Promise<void> {
    console.log("🚪 [AuthRepositoryImpl] Cerrando sesión...");
    return this.dataSource.logout();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const user = await this.dataSource.getCurrentUser();
    console.log("👤 [AuthRepositoryImpl] Usuario actual:", user);
    return user;
  }
}




