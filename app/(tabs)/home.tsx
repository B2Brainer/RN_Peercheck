import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Card, Text } from "react-native-paper";

// 🔹 Modelo equivalente a Course en Flutter
type Course = {
  id: string;
  name: string;
  nrc: number;
  teacher: string;
  category: string;
  enrolledUsers: string[];
  maxStudents: number;
};

// 🔹 Datos de ejemplo locales (mock)
const mockCourses: Course[] = [
  {
    id: "1",
    name: "Optimización I",
    nrc: 12345,
    teacher: "profesor@uni.edu",
    category: "Matemáticas",
    enrolledUsers: ["a@uni.edu", "b@uni.edu"],
    maxStudents: 30,
  },
  {
    id: "2",
    name: "Programación Móvil",
    nrc: 67890,
    teacher: "profesor@uni.edu",
    category: "Informática",
    enrolledUsers: ["c@uni.edu", "d@uni.edu"],
    maxStudents: 25,
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Simula una carga inicial
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Mis Cursos" />
      </Appbar.Header>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator animating />
        </View>
      ) : (
        <ScrollView style={{ padding: 16 }}>
          {courses.map((course) => (
            <Card key={course.id} style={{ marginBottom: 16 }}>
              <Card.Title title={course.name} subtitle={`NRC: ${course.nrc}`} />
              <Card.Content>
                <Text>Profesor: {course.teacher}</Text>
                <Text>Categoría: {course.category}</Text>
                <Text>
                  Inscritos: {course.enrolledUsers.length}/{course.maxStudents}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button mode="outlined" onPress={() => console.log("Detalle", course.name)}>
                  Ver detalles
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
