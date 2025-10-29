import { AuthUser } from "../entities/AuthUser";
import { AuthRepository } from "../repositories/AuthRepository";

export class LoginUseCase {
  constructor(private repo: AuthRepository) {}

  async execute(email: string, password: string): Promise<AuthUser> {
    const user = await this.repo.login(email, password);
    console.log("✅ [LoginUseCase] Usuario autenticado:", user);
    return user;
  }
}
