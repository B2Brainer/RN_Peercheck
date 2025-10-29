import axios from "axios";
import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSource } from "./AuthRemoteDataSource";

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private prefs: ILocalPreferences;

  constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) {
      throw new Error("❌ Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/auth/${this.projectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  // ===========================================================
  // 🔐 LOGIN
  // ===========================================================
  async login(email: string, password: string): Promise<void> {
    try {
      const { data, status } = await axios.post(`${this.baseUrl}/login`, {
        email,
        password,
      });

      if (status === 200 || status === 201) {
        const { accessToken, refreshToken } = data;
        await this.prefs.storeData("token", accessToken);
        await this.prefs.storeData("refreshToken", refreshToken);
        console.log("✅ Login OK");
        return;
      }
      throw new Error("❌ Error en el inicio de sesión");
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Error al iniciar sesión");
    }
  }

  // ===========================================================
  // 🧾 SIGNUP (con verificación)
  // ===========================================================
  async signUp(email: string, password: string): Promise<void> {
    try {
      const { status } = await axios.post(`${this.baseUrl}/signup-direct`, {
        email,
        password,
        name: email.split("@")[0],
      });

      if (status === 200 || status === 201) {
        console.log("✅ Signup OK: se envió correo de verificación");
        return;
      }
      throw new Error("❌ Error en el registro de usuario");
    } catch (error: any) {
      console.error("Signup failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Error al registrarse");
    }
  }

  // ===========================================================
  // 🔓 SIGNUP DIRECT (sin verificación)
  // ===========================================================
  async signUpDirect(email: string, password: string): Promise<void> {
    try {
      const { status } = await axios.post(`${this.baseUrl}/signup-direct`, {
        email,
        password,
        name: email.split("@")[0],
      });

      if (status === 200 || status === 201) {
        console.log("✅ Signup-direct OK");
        return;
      }
      throw new Error("❌ Error al registrar usuario directamente");
    } catch (error: any) {
      console.error("Signup-direct failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Error en signup-direct");
    }
  }

  // ===========================================================
  // 🚪 LOGOUT
  // ===========================================================
  async logOut(): Promise<void> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      if (!token) throw new Error("❌ No token found");

      const { status } = await axios.post(`${this.baseUrl}/logout`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (status === 200 || status === 201) {
        await this.prefs.removeData("token");
        await this.prefs.removeData("refreshToken");
        console.log("✅ Logout OK");
        return;
      }
      throw new Error("❌ Error al cerrar sesión");
    } catch (error: any) {
      console.error("Logout failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Error al cerrar sesión");
    }
  }

  // ===========================================================
  // 🔁 REFRESH TOKEN
  // ===========================================================
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await this.prefs.retrieveData<string>("refreshToken");
      if (!refreshToken) throw new Error("❌ No refresh token found");

      const { data, status } = await axios.post(`${this.baseUrl}/refresh-token`, {
        refreshToken,
      });

      if (status === 200 || status === 201) {
        await this.prefs.storeData("token", data.accessToken);
        console.log("✅ Token refreshed");
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Refresh token failed:", error.response?.data || error.message);
      return false;
    }
  }

  // ===========================================================
  // ✉️ VERIFY EMAIL
  // ===========================================================
  async validate(email: string, validationCode: string): Promise<boolean> {
    try {
      const { status } = await axios.post(`${this.baseUrl}/verify-email`, {
        email,
        code: validationCode,
      });
      return status === 200 || status === 201;
    } catch (error: any) {
      console.error("Validation failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Error al verificar el correo");
    }
  }

  // ===========================================================
  // 🔑 VERIFY TOKEN
  // ===========================================================
  async verifyToken(): Promise<boolean> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      if (!token) return false;

      const { status } = await axios.get(`${this.baseUrl}/verify-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return status === 200;
    } catch (error: any) {
      console.error("Verify token failed:", error.response?.data || error.message);
      return false;
    }
  }

  // ===========================================================
  // 🔁 RECUPERAR CONTRASEÑA
  // ===========================================================
  async forgotPassword(email: string): Promise<boolean> {
    try {
      const { status } = await axios.post(`${this.baseUrl}/forgot-password`, { email });
      return status === 200 || status === 201;
    } catch (error: any) {
      console.error("Forgot password failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Error al enviar correo de recuperación");
    }
  }

  // ===========================================================
  // 🔄 RESTABLECER CONTRASEÑA
  // ===========================================================
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const { status } = await axios.post(`${this.baseUrl}/reset-password`, {
        token,
        newPassword,
      });
      return status === 200 || status === 201;
    } catch (error: any) {
      console.error("Reset password failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Error al restablecer la contraseña");
    }
  }
}
