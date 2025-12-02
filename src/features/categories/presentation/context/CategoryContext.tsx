// CategoryContext.tsx
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Course } from "@/src/features/courses/domain/entities/Course";
import { Student } from "@/src/features/courses/domain/entities/Student";
import React, { createContext, useContext, useState } from "react";
import { Category } from "../../domain/entities/category";
import { Group } from "../../domain/entities/group";
import { AddCategoryUseCase } from "../../domain/usecases/AddCategoryUseCase";
import { AddGroupUseCase } from "../../domain/usecases/AddGroupUseCase";
import { DeleteCategoryUseCase } from "../../domain/usecases/DeleteCategoryUseCase";
import { DeleteGroupUseCase } from "../../domain/usecases/DeleteGroupUseCase";
import { GetCategoriesUseCase } from "../../domain/usecases/GetCategoriesUseCase";
import { GetGroupUseCase } from "../../domain/usecases/GetGroupUseCase";

type CategoryContextType = {
  // State
  categories: Category[];
  groups: Group[][];
  selectedCategory: Category | null;
  
  // Category operations
  refreshCategories: (course: Course) => Promise<void>;
  addCategory: (
    name: string, 
    random: boolean, 
    course: Course, 
    students: Student[], 
    maxMembers: number
  ) => Promise<void>;
  deleteCategory: (categoryId: string, course: Course) => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  
  // Group operations
  getGroupsByCategory: (categoryId: string) => Promise<Group[][]>;
  addStudentToGroup: (groupNumber: number, categoryId: string, studentEmail: string) => Promise<void>;
  removeStudentFromGroup: (groupNumber: number, categoryId: string, studentEmail: string) => Promise<void>;
  moveStudentBetweenGroups: (
    studentEmail: string, 
    categoryId: string, 
    fromGroupNumber: number, 
    toGroupNumber: number
  ) => Promise<void>;
  createManualGroup: (categoryId: string, groupNumber: number, studentEmails: string[]) => Promise<void>;
  isStudentInGroup: (categoryId: string, studentEmail: string) => Promise<boolean>;
};

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {

    const di = useDI();
    const { user } = useAuth();
    
    // Use Cases
    const getCategoriesUC = di.resolve<GetCategoriesUseCase>(TOKENS.GetCategoriesUC);
    const getGroupUC = di.resolve<GetGroupUseCase>(TOKENS.GetGroupUC);
    const addCategoryUC = di.resolve<AddCategoryUseCase>(TOKENS.AddCategoryUC);
    const addGroupUC = di.resolve<AddGroupUseCase>(TOKENS.AddGroupUC);
    const deleteCategoryUC = di.resolve<DeleteCategoryUseCase>(TOKENS.DeleteCategoryUC);
    const deleteGroupUC = di.resolve<DeleteGroupUseCase>(TOKENS.DeleteGroupUC);
  
    const [categories, setCategories] = useState<Category[]>([]);
    const [groups, setGroups] = useState<Group[][]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
    const refreshCategories = async (course: Course): Promise<void> => {
      if (!user) return;
      try {
        const categoriesData = await getCategoriesUC.execute(course.nrc);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error refreshing categories:', error);
      }
    };

    const addCategory = async (
      name: string, 
      random: boolean, 
      course: Course, 
      students: Student[], 
      maxMembers: number
    ): Promise<void> => {
      if (!user) return;
      try {
        await addCategoryUC.execute(name, random, course.nrc, maxMembers);
        await refreshCategories(course);

        // Generate the category ID (same logic as in AddCategoryUseCase)
        const categoryId = `${name}-${course.nrc}`;

        if (random) {
          // Random grouping: distribute students evenly across groups
          const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
          let groupNumber = 1;
          let currentGroupSize = 0;

          for (const student of shuffledStudents) {
            await addGroupUC.execute(groupNumber, categoryId, student.email);
            currentGroupSize++;

            if (currentGroupSize >= maxMembers) {
              groupNumber++;
              currentGroupSize = 0;
            }
          }
        }
        // For self-assigned, groups will be created as students join
      } catch (error) {
        console.error('Error adding category:', error);
        throw error;
      }
    };

    const deleteCategory = async (categoryId: string, course: Course): Promise<void> => {
      if (!user) return;
      try {
        // Extract category name from categoryId (format: "name-nrc")
        const categoryName = categoryId.substring(0, categoryId.lastIndexOf('-'));
        await deleteCategoryUC.execute(categoryName, course.nrc);
        await refreshCategories(course);
        if (selectedCategory?.id === categoryId) {
          setSelectedCategory(null);
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
    };

    const getGroupsByCategory = async (categoryId: string): Promise<Group[][]> => {
      try {
        // Get all groups for this category
        const allGroups: Group[] = [];
        let groupNumber = 1;
        let consecutiveEmptyGroups = 0;
        const maxConsecutiveEmpty = 3; // Stop after finding 3 consecutive empty groups

        // Search for groups, allowing for some empty groups in between
        while (consecutiveEmptyGroups < maxConsecutiveEmpty && groupNumber <= 100) {
          const groupMembers = await getGroupUC.execute(categoryId, groupNumber);
          
          if (groupMembers.length > 0) {
            allGroups.push(...groupMembers);
            consecutiveEmptyGroups = 0; // Reset counter when we find a group with members
          } else {
            consecutiveEmptyGroups++;
          }
          
          groupNumber++;
        }

        // Organize groups by number
        const groupsByNumber: { [key: number]: Group[] } = {};
        allGroups.forEach(group => {
          if (!groupsByNumber[group.number]) {
            groupsByNumber[group.number] = [];
          }
          groupsByNumber[group.number].push(group);
        });

        // Convert to array of arrays and filter out empty groups
        const result = Object.values(groupsByNumber).filter(group => group.length > 0);
        setGroups(result);
        return result;
      } catch (error) {
        console.error('Error getting groups by category:', error);
        throw error;
      }
    };

    const addStudentToGroup = async (
      groupNumber: number, 
      categoryId: string, 
      studentEmail: string
    ): Promise<void> => {
      if (!user) return;
      try {
        await addGroupUC.execute(groupNumber, categoryId, studentEmail);
        await getGroupsByCategory(categoryId);
      } catch (error) {
        console.error('Error adding student to group:', error);
        throw error;
      }
    };

    const removeStudentFromGroup = async (
      groupNumber: number, 
      categoryId: string, 
      studentEmail: string
    ): Promise<void> => {
      if (!user) return;
      try {
        await deleteGroupUC.execute(groupNumber, categoryId, studentEmail);
        await getGroupsByCategory(categoryId);
      } catch (error) {
        console.error('Error removing student from group:', error);
        throw error;
      }
    };

    const moveStudentBetweenGroups = async (
      studentEmail: string, 
      categoryId: string, 
      fromGroupNumber: number, 
      toGroupNumber: number
    ): Promise<void> => {
      if (!user) return;
      try {
        // Remove from old group
        await deleteGroupUC.execute(fromGroupNumber, categoryId, studentEmail);
        // Add to new group
        await addGroupUC.execute(toGroupNumber, categoryId, studentEmail);
        await getGroupsByCategory(categoryId);
      } catch (error) {
        console.error('Error moving student between groups:', error);
        throw error;
      }
    };

    const createManualGroup = async (
      categoryId: string, 
      groupNumber: number, 
      studentEmails: string[]
    ): Promise<void> => {
      if (!user) return;
      try {
        for (const email of studentEmails) {
          await addGroupUC.execute(groupNumber, categoryId, email);
        }
        await getGroupsByCategory(categoryId);
      } catch (error) {
        console.error('Error creating manual group:', error);
        throw error;
      }
    };

    const isStudentInGroup = async (
      categoryId: string,
      studentEmail: string
    ): Promise<boolean> => {
      try {
        const groupsData = await getGroupsByCategory(categoryId);
        // Buscar en todos los grupos si el estudiante está presente
        // Cada Group tiene { number, category, student }
        for (const groupArray of groupsData) {
          for (const group of groupArray) {
            if (group.student === studentEmail) {
              return true;
            }
          }
        }
        return false;
      } catch (error) {
        console.error('Error checking if student is in group:', error);
        return false;
      }
    };

  return (
    <CategoryContext.Provider value={{
      categories,
      groups,
      selectedCategory,
      refreshCategories,
      addCategory,
      deleteCategory,
      setSelectedCategory,
      getGroupsByCategory,
      addStudentToGroup,
      removeStudentFromGroup,
      moveStudentBetweenGroups,
      createManualGroup,
      isStudentInGroup,
    }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
}