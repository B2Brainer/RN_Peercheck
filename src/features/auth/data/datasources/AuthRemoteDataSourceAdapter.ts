import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRemoteDataSourceImpl } from "./AuthRemoteDataSourceImp";
import { IAuthDataSource } from "./iAuthDataSource";

/**
 * Adaptador que hace compatible el RemoteDataSource con IAuthDataSource
 * para mantener el mismo contrato del repositorio.
 */
export class AuthRemoteDataSourceAdapter implements IAuthDataSource {
  private remote: AuthRemoteDataSourceImpl;

  constructor() {
    this.remote = new AuthRemoteDataSourceImpl();
  }

  async login(email: string, password: string): Promise<AuthUser> {
    await this.remote.login(email, password);
    // Simulamos un usuario obtenido tras login
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
    // Intentamos recuperar token; si no hay, devolvemos null
    const tokenIsValid = await this.remote.verifyToken();
    if (!tokenIsValid) return null;

    // Roble no devuelve usuario directamente, así que lo simulamos
    return { email: "user@roble", name: "RemoteUser" };
  }
}
