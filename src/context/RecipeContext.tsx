import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createRecipe as createRecipeInDB,
  deleteRecipe as deleteRecipeInDB,
  importRecipes,
  initializeRecipes,
  type ImportMode,
  updateRecipe as updateRecipeInDB,
} from "../lib/db";
import type { Recipe } from "../types/recipe";

type RecipeInput = {
  name: string;
  category: string;
  imageDataUrl: string;
  ingredients: string[];
  steps: string[];
  notes: string;
  xiaohongshuUrl?: string;
};

type RecipeContextValue = {
  recipes: Recipe[];
  isLoading: boolean;
  storageError: string;
  getRecipeById: (id: string) => Recipe | undefined;
  createRecipe: (input: RecipeInput) => Recipe;
  updateRecipe: (id: string, input: RecipeInput) => Recipe | undefined;
  deleteRecipe: (id: string) => void;
  exportRecipesData: () => Recipe[];
  importRecipesData: (nextRecipes: Recipe[], mode: ImportMode) => Promise<void>;
};

const RecipeContext = createContext<RecipeContextValue | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecipes() {
      try {
        const nextRecipes = await initializeRecipes(async () => {
          const { default: defaultRecipes } = await import("../data/defaultRecipes.json");
          return defaultRecipes;
        });

        if (isMounted) {
          setRecipes(nextRecipes);
          setStorageError("");
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setStorageError("读取本地菜谱失败，请刷新页面再试。");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRecipes();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<RecipeContextValue>(() => {
    function getRecipeById(id: string) {
      return recipes.find((recipe) => recipe.id === id);
    }

    function createRecipe(input: RecipeInput) {
      const now = new Date().toISOString();
      const recipe: Recipe = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      setRecipes((current) => [recipe, ...current]);
      createRecipeInDB(recipe).catch((error) => {
        console.error(error);
        setStorageError("保存菜谱失败，请确认浏览器允许使用本地存储。");
      });
      return recipe;
    }

    function updateRecipe(id: string, input: RecipeInput) {
      const recipe = recipes.find((item) => item.id === id);
      if (!recipe) {
        return undefined;
      }

      const now = new Date().toISOString();
      const updatedRecipe: Recipe = {
        ...recipe,
        ...input,
        updatedAt: now,
      };

      setRecipes((current) => current.map((item) => (item.id === id ? updatedRecipe : item)));
      updateRecipeInDB(updatedRecipe).catch((error) => {
        console.error(error);
        setStorageError("保存修改失败，请稍后再试。");
      });
      return updatedRecipe;
    }

    function deleteRecipe(id: string) {
      setRecipes((current) => current.filter((recipe) => recipe.id !== id));
      deleteRecipeInDB(id).catch((error) => {
        console.error(error);
        setStorageError("删除菜谱失败，请稍后再试。");
      });
    }

    function exportRecipesData() {
      return recipes;
    }

    async function importRecipesData(nextRecipes: Recipe[], mode: ImportMode) {
      try {
        const importedRecipes = await importRecipes(nextRecipes, mode);
        setRecipes(importedRecipes);
        setStorageError("");
      } catch (error) {
        console.error(error);
        setStorageError("导入备份失败，请确认文件格式正确。");
        throw error;
      }
    }

    return {
      recipes,
      isLoading,
      storageError,
      getRecipeById,
      createRecipe,
      updateRecipe,
      deleteRecipe,
      exportRecipesData,
      importRecipesData,
    };
  }, [isLoading, recipes, storageError]);

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used inside RecipeProvider");
  }
  return context;
}
