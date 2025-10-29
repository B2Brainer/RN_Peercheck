import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { router } from "expo-router";
import { FlatList, View } from "react-native";
import { Button, FAB, List, Surface } from "react-native-paper";
import { useProducts } from "../context/productContext";

export default function ProductListScreen() {
  const { products, removeProduct } = useProducts();
  const { logout } = useAuth();

  return (
    <Surface style={{ flex: 1 }}>
      {/* Lista de productos */}
      {products.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <List.Icon icon="cart-outline" />
          <List.Subheader>No products yet</List.Subheader>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 20 }}
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`Qty: ${item.quantity}`}
              left={(props) => <List.Icon {...props} icon="cube-outline" />}
              onPress={() => router.push(`/updateProduct?id=${item._id}`)}
              right={() => (
                <Button onPress={() => removeProduct(item._id)}>Delete</Button>
              )}
            />
          )}
        />
      )}

      {/* Botón flotante para agregar producto */}
      <FAB
        icon="plus"
        style={{
          position: "absolute",
          right: 16,
          bottom: 16,
        }}
        onPress={() => router.push("/addProduct")}
      />
    </Surface>
  );
}

