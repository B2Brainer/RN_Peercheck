import { DIProvider } from '@/src/core/di/DIProvider';
import { ActivityProvider } from '@/src/features/activities/presentation/context/ActivityContext';
import { AuthProvider } from '@/src/features/auth/presentation/context/authContext';
import { CategoryProvider } from '@/src/features/categories/presentation/context/CategoryContext';
import { CourseProvider } from '@/src/features/courses/presentation/context/CourseContext';
import theme from '@/src/theme/theme';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <DIProvider>
      <AuthProvider>
        <CourseProvider>
          <CategoryProvider>
            <ActivityProvider>
              <PaperProvider theme={theme}>
                <Stack screenOptions={{ headerShown: false }} />
              </PaperProvider>
            </ActivityProvider>
          </CategoryProvider>
        </CourseProvider>
      </AuthProvider>
    </DIProvider>
  );
}


