import AppHeader from "../components/AppHeader";
import RecipeForm from "../components/RecipeForm";
import { useNavigate, useParams } from "react-router-dom";
import { useRecipes } from "../context/RecipeContext";

type RecipeFormPageProps = {
  mode: "create" | "edit";
};

export default function RecipeFormPage({ mode }: RecipeFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createRecipe, getRecipeById, isLoading, storageError, updateRecipe } = useRecipes();
  const recipe = mode === "edit" && id ? getRecipeById(id) : undefined;

  function handleSubmit(input: Parameters<typeof createRecipe>[0]) {
    if (mode === "create") {
      const created = createRecipe(input);
      navigate(`/recipes/${created.id}`);
      return;
    }

    if (!id) {
      navigate("/");
      return;
    }

    const updated = updateRecipe(id, input);
    navigate(updated ? `/recipes/${updated.id}` : "/");
  }

  if (mode === "edit" && isLoading) {
    return (
      <main className="page">
        <AppHeader title="编辑菜谱" showBack />
        <section className="detail-section">
          <p>正在读取菜谱...</p>
        </section>
      </main>
    );
  }

  if (mode === "edit" && !recipe) {
    return (
      <main className="page">
        <AppHeader title="菜谱不存在" showBack />
        {storageError ? <p className="notice notice--error">{storageError}</p> : null}
        <section className="detail-section">
          <p>这个菜谱暂时找不到。</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <AppHeader title={mode === "create" ? "新增菜谱" : "编辑菜谱"} showBack />
      {storageError ? <p className="notice notice--error">{storageError}</p> : null}
      <RecipeForm mode={mode} recipe={recipe} onSubmit={handleSubmit} />
    </main>
  );
}
