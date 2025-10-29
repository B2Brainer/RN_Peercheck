import UpdateProductScreen from '@/src/features/products/presentation/screens/UpdateProductScreen';
import { useLocalSearchParams } from 'expo-router';

export default function UpdateProduct() {
  const route = { params: useLocalSearchParams() };
  return <UpdateProductScreen route={route} />;
}


