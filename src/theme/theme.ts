import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import darkColors from "./dark-colors.json";
import lightColors from "./light-colors.json";
import { darkRolePalette, lightRolePalette, RolePalette } from "./RolePalette";

declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      rolePalette: RolePalette;
    }
  }
}

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors.colors,
    rolePalette: lightRolePalette,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors.colors,
    rolePalette: darkRolePalette,
  },
};

export default lightTheme;

