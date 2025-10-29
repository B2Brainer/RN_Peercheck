import { AuthUser } from "../entities/AuthUser";
import { AuthRepository } from "../repositories/AuthRepository";

export class GetCurrentUserUseCase {
  constructor(private repository: AuthRepository) {}

  async execute(): Promise<AuthUser | null> {
    console.log("🔍 [GetCurrentUserUseCase] Ejecutando...");
    const user = await this.repository.getCurrentUser();
    console.log("👤 [GetCurrentUserUseCase] Usuario actual:", user);
    return user;
  }
}


