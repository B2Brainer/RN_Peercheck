import { createContext, useContext, useMemo } from "react";
import { container } from "./container"; // ✅ contenedor global
import { TOKENS } from "./tokens";

import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";

import { GetCurrentUserUseCase } from "@/src/features/auth/domain/usecases/GetCurrentUserUseCase";
import { LoginUseCase } from "@/src/features/auth/domain/usecases/LoginUseCase";
import { LogoutUseCase } from "@/src/features/auth/domain/usecases/LogoutUseCase";
import { SignupUseCase } from "@/src/features/auth/domain/usecases/SignupUseCase";

import { ProductRemoteDataSourceImp } from "@/src/features/products/data/datasources/ProductRemoteDataSourceImp";
import { ProductRepositoryImpl } from "@/src/features/products/data/repositories/ProductRepositoryImpl";
import { AddProductUseCase } from "@/src/features/products/domain/usecases/AddProductUseCase";
import { DeleteProductUseCase } from "@/src/features/products/domain/usecases/DeleteProductUseCase";
import { GetProductByIdUseCase } from "@/src/features/products/domain/usecases/GetProductByIdUseCase";
import { GetProductsUseCase } from "@/src/features/products/domain/usecases/GetProductsUseCase";
import { UpdateProductUseCase } from "@/src/features/products/domain/usecases/UpdateProductUseCase";

const DIContext = createContext<typeof container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
  const appContainer = useMemo(() => {
    const c = container;

    // 🔹 Casos de uso de autenticación
    const authRepo = c.resolve<AuthRepositoryImpl>(TOKENS.AuthRepo);
    c.register(TOKENS.LoginUC, new LoginUseCase(authRepo))
      .register(TOKENS.SignupUC, new SignupUseCase(authRepo))
      .register(TOKENS.LogoutUC, new LogoutUseCase(authRepo))
      .register(TOKENS.GetCurrentUserUC, new GetCurrentUserUseCase(authRepo));

    // ✅ Recuperamos el Auth DS actual con tipado seguro
    const authDS = (authRepo as AuthRepositoryImpl)["dataSource"];

    // 🔹 Dependencias de productos (requiere authDS)
    const remoteDS = new ProductRemoteDataSourceImp(authDS as any);
    const productRepo = new ProductRepositoryImpl(remoteDS);

    c.register(TOKENS.ProductRemoteDS, remoteDS)
      .register(TOKENS.ProductRepo, productRepo)
      .register(TOKENS.AddProductUC, new AddProductUseCase(productRepo))
      .register(TOKENS.UpdateProductUC, new UpdateProductUseCase(productRepo))
      .register(TOKENS.DeleteProductUC, new DeleteProductUseCase(productRepo))
      .register(TOKENS.GetProductsUC, new GetProductsUseCase(productRepo))
      .register(TOKENS.GetProductByIdUC, new GetProductByIdUseCase(productRepo));

    return c;
  }, []);

  return (
    <DIContext.Provider value={appContainer}>
      {children}
    </DIContext.Provider>
  );
}

export function useDI() {
  const c = useContext(DIContext);
  if (!c) throw new Error("DIProvider missing");
  return c;
}

