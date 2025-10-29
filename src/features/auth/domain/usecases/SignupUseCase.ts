import { AuthUser } from "../entities/AuthUser";
import { AuthRepository } from "../repositories/AuthRepository";

export class SignupUseCase {
  constructor(private repo: AuthRepository) {}

  async execute(email: string, password: string): Promise<AuthUser> {
    const user = await this.repo.signup(email, password);
    console.log("✅ [SignupUseCase] Usuario registrado:", user);
    return user;
  }
}

