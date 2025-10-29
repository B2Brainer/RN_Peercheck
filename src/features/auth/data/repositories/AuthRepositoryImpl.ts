import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { IAuthDataSource } from "../datasources/iAuthDataSource";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private dataSource: IAuthDataSource) {}

  async login(email: string, password: string): Promise<AuthUser> {
    return this.dataSource.login(email, password);
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    return this.dataSource.signup(email, password);
  }

  async logout(): Promise<void> {
    return this.dataSource.logout();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.dataSource.getCurrentUser();
  }
}


