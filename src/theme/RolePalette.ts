export interface RolePalette {
  profesorAccent: string;
  estudianteAccent: string;
  profesorCard: string;
  estudianteCard: string;
  surfaceSoft: string;
}

export const lightRolePalette: RolePalette = {
  profesorAccent: '#026CD2', // Azul para profesor
  estudianteAccent: '#FFD60A', // Amarillo para estudiante
  profesorCard: '#E3F2FD', // Fondo claro azul
  estudianteCard: '#FFF8E1', // Fondo claro amarillo
  surfaceSoft: '#F8F9FA', // Fondo gris suave
};

export const darkRolePalette: RolePalette = {
  profesorAccent: '#026CD2', // Azul para profesor
  estudianteAccent: '#FFD60A', // Amarillo para estudiante
  profesorCard: '#0D47A1', // Fondo oscuro azul
  estudianteCard: '#2D2A1D', // Fondo oscuro amarillo
  surfaceSoft: '#1A1C1E', // Fondo oscuro gris
};