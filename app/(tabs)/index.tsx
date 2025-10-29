import ProductListScreen from '@/src/features/products/presentation/screens/ProductListScreen';
import { useNavigation } from 'expo-router';

export default function ProductList() {
  const navigation = useNavigation();
  return <ProductListScreen navigation={navigation} />;
}

