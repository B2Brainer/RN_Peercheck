import { AuthRepository } from "../repositories/AuthRepository";

export class LogoutUseCase {
  constructor(private repo: AuthRepository) {}

  async execute(): Promise<void> {
    console.log("🚪 [LogoutUseCase] Cerrando sesión...");
    return this.repo.logout();
  }
}

