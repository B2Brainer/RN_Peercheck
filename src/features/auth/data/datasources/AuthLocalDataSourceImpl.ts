import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthUser } from "../../domain/entities/AuthUser";
import { IAuthDataSource } from "./iAuthDataSource";

export class AuthLocalDataSourceImpl implements IAuthDataSource {
  private prefs: ILocalPreferences;

  constructor() {
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    const users = await this.prefs.getAllEntries<AuthUser>("users");
    const existing = users.find((u) => u.email === email);
    if (existing) throw new Error("User already exists");

    const newUser: AuthUser = {
      id: Date.now().toString(),
      email,
      name: email.split("@")[0],
      password,
    };

    await this.prefs.storeEntry("users", newUser);
    await this.prefs.storeData("currentUser", newUser);
    return newUser;
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const users = await this.prefs.getAllEntries<AuthUser>("users");
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) throw new Error("Invalid credentials");

    await this.prefs.storeData("currentUser", user);
    return user;
  }

  async logout(): Promise<void> {
    await this.prefs.removeData("currentUser");
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.prefs.retrieveData<AuthUser>("currentUser");
  }
}


