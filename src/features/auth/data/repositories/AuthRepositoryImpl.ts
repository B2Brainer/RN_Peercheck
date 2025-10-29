import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { IAuthDataSource } from "../datasources/iAuthDataSource";

export class AuthRepositoryImpl implements AuthRepository {
  private dataSource: IAuthDataSource;

  constructor(dataSource: IAuthDataSource) {
    this.dataSource = dataSource;
  }

  async login(email: string, password: string): Promise<void> {
    await this.dataSource.login(email, password);
  }

  async signup(email: string, password: string): Promise<void> {
    await this.dataSource.signup(email, password);
  }

  async logout(): Promise<void> {
    await this.dataSource.logout();
  }

  async getCurrentUser() {
    return this.dataSource.getCurrentUser();
  }
}


