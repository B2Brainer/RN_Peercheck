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
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error("Credenciales inválidas");
    await this.prefs.storeData(this.CURRENT_USER_KEY, found);
    return found;
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    const users = await this.prefs.getAllEntries<AuthUser>(this.USERS_KEY);
    const exists = users.some(u => u.email === email);
    if (exists) throw new Error("El usuario ya existe");
    const newUser: AuthUser = { id: uuid.v4().toString(), email, password };
    users.push(newUser);
    await this.prefs.replaceEntries(this.USERS_KEY, users);
    await this.prefs.storeData(this.CURRENT_USER_KEY, newUser);
    return newUser;
  }

  async logout(): Promise<void> {
    await this.prefs.removeData(this.CURRENT_USER_KEY);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return await this.prefs.retrieveData<AuthUser>(this.CURRENT_USER_KEY);
  }
}
