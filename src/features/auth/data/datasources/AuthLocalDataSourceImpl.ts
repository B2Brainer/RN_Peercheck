import axios from "axios";
import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSource } from "./AuthRemoteDataSource";

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private prefs: ILocalPreferences;

  constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) throw new Error("❌ Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/auth/${this.projectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async login(email: string, password: string): Promise<void> {
    const { data } = await axios.post(`${this.baseUrl}/login`, { email, password });
    await this.prefs.storeData("token", data.accessToken);
    await this.prefs.storeData("refreshToken", data.refreshToken);
  }

  async signUp(email: string, password: string): Promise<void> {
    await axios.post(`${this.baseUrl}/signup`, {
      email,
      password,
      name: email.split("@")[0],
    });
  }

  async logOut(): Promise<void> {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) return;
    await axios.post(`${this.baseUrl}/logout`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await this.prefs.removeData("token");
    await this.prefs.removeData("refreshToken");
  }

  async validate(email: string, code: string): Promise<boolean> {
    const res = await axios.post(`${this.baseUrl}/verify-email`, { email, code });
    return res.status === 200 || res.status === 201;
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = await this.prefs.retrieveData<string>("refreshToken");
    if (!refreshToken) return false;
    const { data } = await axios.post(`${this.baseUrl}/refresh-token`, { refreshToken });
    await this.prefs.storeData("token", data.accessToken);
    return true;
  }

  async forgotPassword(email: string): Promise<boolean> {
    await axios.post(`${this.baseUrl}/forgot-password`, { email });
    return true;
  }

  async resetPassword(email: string, newPassword: string, code: string): Promise<boolean> {
    await axios.post(`${this.baseUrl}/reset-password`, {
      token: code,
      newPassword,
    });
    return true;
  }

  async verifyToken(): Promise<boolean> {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) return false;
    const res = await axios.get(`${this.baseUrl}/verify-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.status === 200;
  }
}
