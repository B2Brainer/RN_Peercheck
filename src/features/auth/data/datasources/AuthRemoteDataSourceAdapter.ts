import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRemoteDataSourceImpl } from "./AuthRemoteDataSourceImp";
import { IAuthDataSource } from "./iAuthDataSource";

export class AuthRemoteDataSourceAdapter implements IAuthDataSource {
  private remote = new AuthRemoteDataSourceImpl();

  async login(email: string, password: string): Promise<AuthUser> {
    await this.remote.login(email, password);
    return { email, name: email.split("@")[0] };
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    await this.remote.signUp(email, password);
    return { email, name: email.split("@")[0] };
  }

  async logout(): Promise<void> {
    await this.remote.logOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const valid = await this.remote.verifyToken();
    if (!valid) return null;
    return { email: "user@roble", name: "RemoteUser" };
  }
}
