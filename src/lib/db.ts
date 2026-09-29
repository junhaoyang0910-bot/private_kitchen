import type { Recipe } from "../types/recipe";

export type ImportMode = "merge" | "replace";

const DB_NAME = "personal-recipe-db";
const DB_VERSION = 1;
const RECIPE_STORE = "recipes";

let dbPromise: Promise<IDBDatabase> | undefined;

export async function initDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(RECIPE_STORE)) {
          const store = db.createObjectStore(RECIPE_STORE, { keyPath: "id" });
          store.createIndex("updatedAt", "updatedAt");
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return dbPromise;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const recipes = await runStoreRequest<Recipe[]>("readonly", (store) => store.getAll());
  return recipes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function initializeRecipes(loadDefaultRecipes: () => Promise<readonly Recipe[]>): Promise<Recipe[]> {
  const storedRecipes = await getAllRecipes();
  if (storedRecipes.length > 0) {
    return storedRecipes;
  }

  const defaultRecipes = await loadDefaultRecipes();
  const db = await initDB();

  await new Promise<void>((resolve, reject) => {
    // Keep the empty check and inserts atomic, including across tabs and StrictMode effects.
    const transaction = db.transaction(RECIPE_STORE, "readwrite");
    const store = transaction.objectStore(RECIPE_STORE);
    const countRequest = store.count();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error ?? new Error("Recipe initialization aborted"));

    countRequest.onsuccess = () => {
      if (countRequest.result !== 0) {
        return;
      }

      try {
        defaultRecipes.forEach((recipe) => store.add(recipe));
      } catch (error) {
        transaction.abort();
        reject(error);
      }
    };
  });

  return await getAllRecipes();
}

export async function getRecipeById(id: string): Promise<Recipe | undefined> {
  return await runStoreRequest<Recipe | undefined>("readonly", (store) => store.get(id));
}

export async function createRecipe(recipe: Recipe): Promise<Recipe> {
  await runStoreRequest("readwrite", (store) => store.add(recipe));
  return recipe;
}

export async function updateRecipe(recipe: Recipe): Promise<Recipe> {
  await runStoreRequest("readwrite", (store) => store.put(recipe));
  return recipe;
}

export async function deleteRecipe(id: string): Promise<void> {
  await runStoreRequest("readwrite", (store) => store.delete(id));
}

export async function exportRecipes(): Promise<Recipe[]> {
  return await getAllRecipes();
}

export async function importRecipes(recipes: Recipe[], mode: ImportMode): Promise<Recipe[]> {
  const db = await initDB();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(RECIPE_STORE, "readwrite");
    const store = transaction.objectStore(RECIPE_STORE);

    if (mode === "replace") {
      store.clear();
    }

    recipes.forEach((recipe) => {
      store.put(recipe);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

  return await getAllRecipes();
}

async function runStoreRequest<T>(
  mode: IDBTransactionMode,
  createRequest: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await initDB();

  return await new Promise((resolve, reject) => {
    const transaction = db.transaction(RECIPE_STORE, mode);
    const store = transaction.objectStore(RECIPE_STORE);
    const request = createRequest(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
