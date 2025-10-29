import { DIProvider } from '@/src/core/di/DIProvider';
import { AuthProvider } from '@/src/features/auth/presentation/context/authContext';
import { ProductProvider } from '@/src/features/products/presentation/context/productContext';
import theme from '@/src/theme/theme';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <DIProvider>
      <AuthProvider>
        <ProductProvider>
          <PaperProvider theme={theme}>
            <Stack screenOptions={{ headerShown: false }} />
          </PaperProvider>
        </ProductProvider>
      </AuthProvider>
    </DIProvider>
  );
}


