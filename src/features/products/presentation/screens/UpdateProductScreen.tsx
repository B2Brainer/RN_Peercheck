import { Product } from "@/src/features/products/domain/entities/Product";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { useProducts } from "../context/productContext";

export default function UpdateProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProduct, updateProduct } = useProducts();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!id) {
          setNotFound(true);
          return;
        }

        const p = await getProduct(id as string);
        if (!p) {
          setNotFound(true);
        } else {
          setProduct(p);
          setName(p.name);
          setDescription(p.description);
          setQuantity(p.quantity.toString());
        }
      } catch (error) {
        console.error("Error loading product:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleUpdate = async () => {
    if (!product) return;
    await updateProduct({
      _id: product._id,
      name,
      description,
      quantity: Number(quantity),
    });
    router.back();
  };

  if (loading) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", padding: 16 }}>
        <Text>Loading product...</Text>
      </Surface>
    );
  }

  if (notFound) {
    return (
      <Surface style={{ flex: 1, justifyContent: "center", padding: 16 }}>
        <Text variant="bodyLarge" style={{ color: "red" }}>
          Product not found
        </Text>
      </Surface>
    );
  }

  return (
    <Surface style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={{ marginBottom: 12 }}
      />

      <Button mode="contained" onPress={handleUpdate}>
        Update
      </Button>
    </Surface>
  );
}

