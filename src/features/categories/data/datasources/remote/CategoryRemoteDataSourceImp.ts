// CategoryRemoteDataSourceImp.ts

import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import axios from "axios";
import { CategoryRemoteDataSource } from "./CategoryRemoteDataSource";

export class CategoryRemoteDataSourceImpl implements CategoryRemoteDataSource {
        private readonly projectId: string;
    private readonly baseUrl: string;
    private prefs: ILocalPreferences;
    
    constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
        if (!projectId) {
            throw new Error("❌ Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
        }
        
        this.projectId = projectId;
        this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${this.projectId}`;
        this.prefs = LocalPreferencesAsyncStorage.getInstance();
    }

    /* ───────────────────────────────────────────── */
    /* INSERT                                        */
    /* POST /:id/insert                              */
    /* ───────────────────────────────────────────── */
    async insert<T>(tableName: string, records: T[]): Promise<void> {
        try {
            const token = await this.prefs.retrieveData<string>("token");
            if (!token) throw new Error("❌ No token found");

            const { data, status } = await axios.post(
                `${this.baseUrl}/insert`,
                { tableName, records },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (status === 200 || status === 201) {
                console.log("✅ Insert OK:", data);
                return;
            }

            throw new Error("❌ Error en la inserción de registros");
        } catch (error: any) {
            console.error("Insert failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Error al insertar registros");
        }
    }

    /* ───────────────────────────────────────────── */
    /* READ                                         */
    /* GET /:id/read                                */
    /* ───────────────────────────────────────────── */
    async read<T>(tableName: string, filters?: Partial<T>): Promise<T[]> {
        try {
            const token = await this.prefs.retrieveData<string>("token");
            if (!token) throw new Error("❌ No token found");

            const query = {
                tableName,
                ...(filters || {}),
            };

            const { data, status } = await axios.get(
                `${this.baseUrl}/read`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: query,
                }
            );

            if (status === 200 || status === 201) {
                console.log(`✅ Read OK: retrieved ${data.length} records`);
                return data as T[];
            }

            throw new Error("❌ Error en la lectura de registros");
        } catch (error: any) {
            console.error("Read failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Error al leer registros");
        }
    }

    /* ───────────────────────────────────────────── */
    /* UPDATE                                       */
    /* POST /:id/update                             */
    /* ───────────────────────────────────────────── */
    async update<T>(
        tableName: string,
        idColumn: keyof T,
        idValue: T[keyof T],
        updates: Partial<T>
    ): Promise<void> {
        try {
            const token = await this.prefs.retrieveData<string>("token");
            if (!token) throw new Error("❌ No token found");

            const { status } = await axios.post(
                `${this.baseUrl}/update`,
                {
                    tableName,
                    idColumn,
                    idValue,
                    updates,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (status === 200 || status === 201) {
                console.log(`✅ Update OK: updated record where ${String(idColumn)}=${idValue}`);
                return;
            }

            throw new Error("❌ Error en la actualización de registros");
        } catch (error: any) {
            console.error("Update failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Error al actualizar registros");
        }
    }

    /* ───────────────────────────────────────────── */
    /* DELETE                                       */
    /* POST /:id/delete                             */
    /* ───────────────────────────────────────────── */
    async delete<T>(tableName: string, idColumn: keyof T, idValue: T[keyof T]): Promise<void> {
  try {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) throw new Error("❌ No token found");

    const { status } = await axios.delete(`${this.baseUrl}/delete`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        tableName,
        idColumn,
        idValue,
      },
    });

    if (status === 200 || status === 201) {
      console.log(`✅ Delete OK: deleted record with ${String(idColumn)}=${idValue}`);
      return;
    }

    throw new Error("❌ Error en la eliminación de registros");
  } catch (error: any) {
    console.error("Delete failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error al eliminar registros");
  }
}
}