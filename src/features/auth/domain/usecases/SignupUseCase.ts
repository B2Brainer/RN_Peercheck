import { AuthUser } from "../entities/AuthUser";
import { AuthRepository } from "../repositories/AuthRepository";

export class SignupUseCase {
  constructor(private repo: AuthRepository) {}

  async execute(email: string, password: string): Promise<AuthUser> {
    await this.repo.signup(email, password);
    console.log("✅ [SignupUseCase] Usuario registrado:", email);
    const user: AuthUser = { email };
    return user;
  }
}
