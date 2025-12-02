// CourseRepositoryImpl.ts

import { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import { CategoryRemoteDataSource } from "./remote/CategoryRemoteDataSource";

export class CategoryRepositoryImpl implements CategoryRepository {
  private dataSource: CategoryRemoteDataSource;
  
  constructor(dataSource: CategoryRemoteDataSource) {
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