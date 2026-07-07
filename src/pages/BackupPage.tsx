import { Download, FileUp } from "lucide-react";
import { useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import { useRecipes } from "../context/RecipeContext";
import type { ImportMode } from "../lib/db";
import type { Recipe } from "../types/recipe";

export default function BackupPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportRecipesData, importRecipesData, isLoading, recipes, storageError } = useRecipes();
  const [pendingRecipes, setPendingRecipes] = useState<Recipe[] | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  function handleExport() {
    const backup = {
      app: "personal-recipe-pwa",
      version: 1,
      exportedAt: new Date().toISOString(),
      recipes: exportRecipesData(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `我的菜谱备份-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("备份文件已生成。");
    setError("");
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const nextRecipes = parseBackupRecipes(parsed);
      setPendingRecipes(nextRecipes);
      setMessage("");
      setError("");
    } catch {
      setPendingRecipes(null);
      setMessage("");
      setError("无法读取这个备份文件，请确认它是从本应用导出的 JSON 文件。");
    }
  }

  async function handleImport(mode: ImportMode) {
    if (!pendingRecipes) {
      return;
    }

    setIsImporting(true);
    try {
      await importRecipesData(pendingRecipes, mode);
      setMessage(mode === "replace" ? "已覆盖导入备份。" : "已合并导入备份。");
      setError("");
      setPendingRecipes(null);
    } catch {
      setError("导入失败，请稍后再试。");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <main className="page">
      <AppHeader title="数据备份" showBack />
      {storageError ? <p className="notice notice--error">{storageError}</p> : null}
      {message ? <p className="notice notice--success">{message}</p> : null}
      {error ? <p className="notice notice--error">{error}</p> : null}
      <section className="backup-panel">
        <h2>导出备份</h2>
        <p>把当前 {recipes.length} 道菜导出为 JSON 文件，换手机或清除浏览器数据前建议先备份。</p>
        <button className="primary-button backup-action" type="button" onClick={handleExport} disabled={isLoading}>
          <Download size={18} />
          导出 JSON
        </button>
      </section>
      <section className="backup-panel">
        <h2>导入备份</h2>
        <p>选择备份文件后，可以合并到现有菜谱，也可以用备份覆盖当前数据。</p>
        <input ref={fileInputRef} accept="application/json,.json" hidden type="file" onChange={handleFileChange} />
        <button
          className="secondary-button backup-action"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isImporting}
        >
          <FileUp size={18} />
          选择备份文件
        </button>
      </section>
      {pendingRecipes ? (
        <div className="dialog-backdrop" role="presentation">
          <section className="confirm-dialog confirm-dialog--wide" role="dialog" aria-modal="true" aria-labelledby="import-title">
            <h2 id="import-title">导入 {pendingRecipes.length} 道菜？</h2>
            <p>合并会保留现有菜谱，并用备份中相同 id 的菜谱更新旧记录。覆盖会先清空当前菜谱，再导入备份。</p>
            <div className="confirm-dialog__actions confirm-dialog__actions--three">
              <button className="secondary-button" type="button" onClick={() => setPendingRecipes(null)} disabled={isImporting}>
                取消
              </button>
              <button className="secondary-button" type="button" onClick={() => handleImport("merge")} disabled={isImporting}>
                合并
              </button>
              <button className="danger-button" type="button" onClick={() => handleImport("replace")} disabled={isImporting}>
                覆盖
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function parseBackupRecipes(value: unknown): Recipe[] {
  const recipes = Array.isArray(value) ? value : getObjectRecipes(value);

  if (!recipes.every(isRecipe)) {
    throw new Error("Invalid backup file");
  }

  return recipes;
}

function getObjectRecipes(value: unknown): unknown[] {
  if (value && typeof value === "object" && "recipes" in value) {
    const recipes = (value as { recipes: unknown }).recipes;
    if (Array.isArray(recipes)) {
      return recipes;
    }
  }

  throw new Error("Invalid backup file");
}

function isRecipe(value: unknown): value is Recipe {
  if (!value || typeof value !== "object") {
    return false;
  }

  const recipe = value as Recipe;
  return (
    typeof recipe.id === "string" &&
    typeof recipe.name === "string" &&
    typeof recipe.category === "string" &&
    typeof recipe.imageDataUrl === "string" &&
    Array.isArray(recipe.ingredients) &&
    recipe.ingredients.every((item) => typeof item === "string") &&
    Array.isArray(recipe.steps) &&
    recipe.steps.every((item) => typeof item === "string") &&
    typeof recipe.notes === "string" &&
    (recipe.xiaohongshuUrl === undefined || typeof recipe.xiaohongshuUrl === "string") &&
    typeof recipe.createdAt === "string" &&
    typeof recipe.updatedAt === "string"
  );
}
