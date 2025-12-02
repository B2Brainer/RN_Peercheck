
export interface CourseRemoteDataSource {
    insert<T>(tableName: string, records: T[]): Promise<void>;
    read<T>(tableName: string, filters?: Partial<T>): Promise<T[]>;
    update<T>(tableName: string, idColumn: keyof T, idValue: T[keyof T], updates: Partial<T>): Promise<void>;
    delete<T>(tableName: string, idColumn: keyof T, idValue: T[keyof T]): Promise<void>;
}