// ActivityRepositoryImpl.ts

import { ActivityRepository } from "../../domain/repositories/ActivityRepository";
import { ActivityRemoteDataSource } from "./remote/ActivityRemoteDataSource";

export class ActivityRepositoryImpl implements ActivityRepository {
    private dataSource: ActivityRemoteDataSource;

    constructor(dataSource: ActivityRemoteDataSource) {
        this.dataSource = dataSource;
    }

    insert<T>(tableName: string, records: T[]): Promise<void> {
        return this.dataSource.insert(tableName, records);
    }
    read<T>(tableName: string, filters?: Partial<T>): Promise<T[]> {
        return this.dataSource.read(tableName, filters);
    }
    update<T>(tableName: string, idColumn: keyof T, idValue: T[keyof T], updates: Partial<T>): Promise<void> {
        return this.dataSource.update(tableName, idColumn, idValue, updates);
    }
    delete<T>(tableName: string, idColumn: keyof T, idValue: T[keyof T]): Promise<void> {
        return this.dataSource.delete(tableName, idColumn, idValue);
    }
}