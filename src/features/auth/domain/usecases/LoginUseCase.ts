  import { AuthUser } from "../entities/AuthUser";
import { AuthRepository } from "../repositories/AuthRepository";

  export class LoginUseCase {
    constructor(private repo: AuthRepository) {}

    async execute(email: string, password: string): Promise<AuthUser> {
      await this.repo.login(email, password);
      const user: AuthUser = { email };
      console.log("🚪 [LoginUseCase] Usuario logueado:", user);
      return user;
    }
  }

