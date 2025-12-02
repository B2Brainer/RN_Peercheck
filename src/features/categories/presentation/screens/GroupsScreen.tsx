// src/features/categories/presentation/screens/GroupsScreen.tsx
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { useCourse } from "@/src/features/courses/presentation/context/CourseContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { Group } from "../../domain/entities/group";
import { useCategory } from "../context/CategoryContext";

const GroupsScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { isProfesor, students } = useCourse();
  const {
    selectedCategory,
    groups,
    getGroupsByCategory,
    addStudentToGroup,
    removeStudentFromGroup,
    moveStudentBetweenGroups,
  } = useCategory();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGroupNumber, setSelectedGroupNumber] = useState<number>(1);
  const [selectedStudentEmail, setSelectedStudentEmail] = useState("");

  const palette = (theme.colors as any).rolePalette;
  const accent = isProfesor ? palette.profesorAccent : palette.estudianteAccent;
  const cardBg = isProfesor ? palette.profesorCard : palette.estudianteCard;
  const surface = palette.surfaceSoft;

  useEffect(() => {
    if (selectedCategory?.id) {
      getGroupsByCategory(selectedCategory.id);
    }
  }, [selectedCategory]);

  const onRefresh = async () => {
    if (!selectedCategory?.id) return;
    setRefreshing(true);
    await getGroupsByCategory(selectedCategory.id);
    setRefreshing(false);
  };

  const handleRemoveStudent = async (groupNumber: number, studentEmail: string) => {
    if (!selectedCategory?.id || !isProfesor) return;
    try {
      await removeStudentFromGroup(groupNumber, selectedCategory.id, studentEmail);
    } catch (error) {
      console.error("Error removing student:", error);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedCategory?.id || !selectedStudentEmail.trim()) return;
    try {
      await addStudentToGroup(selectedGroupNumber, selectedCategory.id, selectedStudentEmail.trim());
      setShowAddModal(false);
      setSelectedStudentEmail("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo agregar el estudiante");
    }
  };

  const openAddModal = (groupNumber: number) => {
    setSelectedGroupNumber(groupNumber);
    setShowAddModal(true);
  };

  // Obtener estudiantes disponibles (no asignados a ningún grupo en esta categoría)
  const getAvailableStudents = () => {
    const assignedEmails = groups.flat().map(g => g.student);
    return students.filter(s => !assignedEmails.includes(s.email));
  };

  // Verificar si el estudiante actual ya está en algún grupo de esta categoría
  const isStudentInAnyGroup = (): boolean => {
    if (!user) return false;
    const assignedEmails = groups.flat().map(g => g.student);
    return assignedEmails.includes(user.email);
  };

  // Manejar cuando un estudiante se une a un grupo
  const handleStudentJoinGroup = async (groupNumber: number) => {
    if (!selectedCategory?.id || !user) return;
    
    // Verificar si ya está en un grupo
    if (isStudentInAnyGroup()) {
      Alert.alert(
        "Ya estás en un grupo",
        "Ya perteneces a un grupo en esta categoría. ¿Deseas cambiarte a este grupo?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Cambiar",
            onPress: async () => {
              try {
                // Encontrar el grupo actual del estudiante
                const currentGroup = groups.find(g => 
                  g.some(member => member.student === user.email)
                );
                if (currentGroup && currentGroup[0]) {
                  // Mover al nuevo grupo
                  await moveStudentBetweenGroups(
                    user.email,
                    selectedCategory.id!,
                    currentGroup[0].number,
                    groupNumber
                  );
                  Alert.alert("Éxito", "Te has cambiado de grupo exitosamente");
                }
              } catch (error: any) {
                Alert.alert("Error", error.message || "No se pudo cambiar de grupo");
              }
            }
          }
        ]
      );
    } else {
      // Unirse directamente al grupo
      try {
        await addStudentToGroup(groupNumber, selectedCategory.id!, user.email);
        Alert.alert("Éxito", "Te has unido al grupo exitosamente");
      } catch (error: any) {
        Alert.alert("Error", error.message || "No se pudo unir al grupo");
      }
    }
  };

  if (!selectedCategory) {
    return (
      <View style={styles.container}>
        <Text>No hay categoría seleccionada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.categoryName}>{selectedCategory.name}</Text>
          <Text style={styles.categoryType}>
            {selectedCategory.random ? "🎲 Aleatorio" : "✋ Auto-asignado"}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Grupos</Text>

      <View style={[styles.groupsContainer, { backgroundColor: surface }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {groups.length === 0 ? (
            <Text style={styles.emptyText}>No hay grupos creados aún</Text>
          ) : (
            groups.map((groupMembers, index) => (
              <GroupCard
                key={index}
                groupNumber={groupMembers[0]?.number || index + 1}
                members={groupMembers}
                bg={cardBg}
                accent={accent}
                isProfesor={isProfesor}
                isRandomCategory={selectedCategory.random}
                maxMembers={selectedCategory.max}
                onRemoveStudent={handleRemoveStudent}
                onAddStudent={openAddModal}
                onStudentJoin={handleStudentJoinGroup}
              />
            ))
          )}

          {/* Botón para crear nuevo grupo manual - solo profesor */}
          {isProfesor && !selectedCategory.random && (
            <TouchableOpacity
              style={[styles.addGroupButton, { backgroundColor: cardBg }]}
              onPress={() => openAddModal(groups.length + 1)}
            >
              <Text style={styles.addGroupText}>+ Crear Nuevo Grupo</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Modal para agregar estudiante */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Estudiante al Grupo {selectedGroupNumber}</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Email del estudiante"
              value={selectedStudentEmail}
              onChangeText={setSelectedStudentEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Lista de estudiantes disponibles */}
            <Text style={styles.availableTitle}>Estudiantes disponibles:</Text>
            <ScrollView style={styles.studentsList}>
              {getAvailableStudents().map((student) => (
                <TouchableOpacity
                  key={student.email}
                  style={styles.studentItem}
                  onPress={() => setSelectedStudentEmail(student.email)}
                >
                  <Text style={styles.studentEmail}>{student.email}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddModal(false);
                  setSelectedStudentEmail("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: accent }]}
                onPress={handleAddStudent}
              >
                <Text style={[styles.modalButtonText, { color: "#FFF" }]}>
                  Agregar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* CARD DE GRUPO                                                   */
/* ─────────────────────────────────────────────────────────────── */
const GroupCard = ({
  groupNumber,
  members,
  bg,
  accent,
  isProfesor,
  isRandomCategory,
  maxMembers,
  onRemoveStudent,
  onAddStudent,
  onStudentJoin,
}: {
  groupNumber: number;
  members: Group[];
  bg: string;
  accent: string;
  isProfesor: boolean;
  isRandomCategory: boolean;
  maxMembers: number;
  onRemoveStudent: (groupNumber: number, studentEmail: string) => void;
  onAddStudent: (groupNumber: number) => void;
  onStudentJoin: (groupNumber: number) => void;
}) => {
  // Verificar si el grupo ya está lleno
  const isGroupFull = members.length >= maxMembers;

  return (
    <View style={[styles.groupCard, { backgroundColor: bg }]}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>Grupo {groupNumber}</Text>
        <Text style={styles.memberCount}>
          {members.length}/{maxMembers} miembros
        </Text>
      </View>

      {members.map((member) => (
        <View key={member.id} style={styles.memberItem}>
          <Text style={styles.memberEmail}>{member.student}</Text>
          {isProfesor && (
            <TouchableOpacity
              onPress={() => onRemoveStudent(groupNumber, member.student)}
              style={styles.removeButton}
            >
              <MaterialCommunityIcons name="close" size={16} color="#B91C1C" />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Botón para que el profesor agregue miembros - solo si no está lleno */}
      {isProfesor && !isGroupFull && (
        <TouchableOpacity
          style={styles.addMemberButton}
          onPress={() => onAddStudent(groupNumber)}
        >
          <MaterialCommunityIcons name="plus" size={16} color="#666" />
          <Text style={styles.addMemberText}>Agregar miembro</Text>
        </TouchableOpacity>
      )}

      {/* Mensaje cuando el grupo está lleno */}
      {isGroupFull && (
        <View style={styles.fullGroupMessage}>
          <MaterialCommunityIcons name="check-circle" size={16} color="#059669" />
          <Text style={styles.fullGroupText}>Grupo completo</Text>
        </View>
      )}

      {/* Botón para que el estudiante se una al grupo - solo en categorías auto-asignadas y si no está lleno */}
      {!isProfesor && !isRandomCategory && !isGroupFull && (
        <TouchableOpacity
          style={[styles.joinGroupButton, { backgroundColor: accent }]}
          onPress={() => onStudentJoin(groupNumber)}
        >
          <MaterialCommunityIcons name="account-plus" size={18} color="#FFF" />
          <Text style={styles.joinGroupText}>Unirme a este grupo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* STYLES                                                         */
/* ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    marginLeft: 16,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: "700",
  },
  categoryType: {
    fontSize: 14,
    color: "#666",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 12,
  },
  groupsContainer: {
    flex: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 14,
  },
  scrollView: {
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
    fontSize: 16,
  },
  groupCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  memberCount: {
    fontSize: 14,
    color: "#666",
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
    marginBottom: 6,
  },
  memberEmail: {
    fontSize: 14,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  addMemberButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  addMemberText: {
    marginLeft: 6,
    color: "#666",
    fontSize: 14,
  },
  fullGroupMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  fullGroupText: {
    marginLeft: 6,
    color: "#059669",
    fontSize: 14,
    fontWeight: "600",
  },
  joinGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  joinGroupText: {
    marginLeft: 8,
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  addGroupButton: {
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  addGroupText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    width: "85%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E9EAEE",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  availableTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  studentsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  studentItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginBottom: 8,
  },
  studentEmail: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#E9EAEE",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default GroupsScreen;
