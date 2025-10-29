import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import uuid from "react-native-uuid";
import { AuthUser } from "../../domain/entities/AuthUser";
import { IAuthDataSource } from "./iAuthDataSource";

export class AuthLocalDataSourceImpl implements IAuthDataSource {
  private prefs: ILocalPreferences;
  private readonly USERS_KEY = "users";
  private readonly CURRENT_USER_KEY = "currentUser";

  constructor() {
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async login(email: string, password: string): Promise<AuthUser> {
    console.log("🔐 [login] Intentando con:", email);

    const users = await this.prefs.getAllEntries<AuthUser>(this.USERS_KEY);
    console.log("📦 [login] Usuarios actuales:", users);

    const found = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!found) {
      throw new Error("Credenciales inválidas");
    }

    await this.prefs.storeData(this.CURRENT_USER_KEY, found);
    const current = await this.prefs.retrieveData<AuthUser>("currentUser");
console.log("📦 [AsyncStorage] currentUser guardado:", current);
    console.log("✅ [login] Usuario autenticado:", found);
    return found;
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    console.log("🟢 [signup] Intentando registrar usuario:", email);

    const users = await this.prefs.getAllEntries<AuthUser>(this.USERS_KEY);
    console.log("📦 [signup] Usuarios actuales:", users);

    const exists = users.some((u) => u.email === email);
    if (exists) throw new Error("El usuario ya existe");

    const newUser: AuthUser = {
      email,
      password,
      id: uuid.v4().toString(),
    };

    users.push(newUser);
    await this.prefs.replaceEntries(this.USERS_KEY, users);
    await this.prefs.storeData(this.CURRENT_USER_KEY, newUser);

    console.log("✅ [signup] Usuario registrado con éxito:", newUser);
    return newUser;
  }

  async logout(): Promise<void> {
    console.log("🚪 [logout] Cerrando sesión local...");
    await this.prefs.removeData(this.CURRENT_USER_KEY);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const user = await this.prefs.retrieveData<AuthUser>(this.CURRENT_USER_KEY);
    console.log("👤 [getCurrentUser] Usuario actual:", user);
    return user;
  }
}





