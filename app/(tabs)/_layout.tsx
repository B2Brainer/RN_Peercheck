import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Productos' }} />
      <Tabs.Screen name="settings" options={{ title: 'Configuración' }} />
    </Tabs>
  );
}
