import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import CategoryFilter from "../components/CategoryFilter";
import EmptyState from "../components/EmptyState";
import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";
import { useRecipes } from "../context/RecipeContext";

export default function HomePage() {
  const { isLoading, recipes: allRecipes, storageError } = useRecipes();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");

  const categories = useMemo(
    () => Array.from(new Set(allRecipes.map((recipe) => recipe.category).filter(Boolean))),
    [allRecipes],
  );

  const recipes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allRecipes.filter((recipe) => {
      const matchesName = recipe.name.toLowerCase().includes(normalizedQuery);
      const matchesCategory = category === "全部" || recipe.category === category;
      return matchesName && matchesCategory;
    });
  }, [allRecipes, category, query]);

  return (
    <main className="page page--with-fab">
      <AppHeader title="我的菜谱" showBackup />
      <section className="brand-masthead" aria-label="Junhao's Private Kitchen">
        <img src="/brand-logo-cropped.png" alt="Junhao's Private Kitchen" />
      </section>
      <section className="home-tools">
        <SearchBar value={query} onChange={setQuery} />
        <CategoryFilter categories={categories} value={category} onChange={setCategory} />
      </section>
      {storageError ? <p className="notice notice--error">{storageError}</p> : null}

      {isLoading ? (
        <EmptyState title="正在读取菜谱" description="正在从手机浏览器本地存储中加载数据。" />
      ) : recipes.length > 0 ? (
        <section className="recipe-grid" aria-label="菜谱列表">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </section>
      ) : (
        <EmptyState title="没有找到菜谱" description={query || category !== "全部" ? "换个关键词或分类试试。" : "点右下角按钮记录第一道菜。"} />
      )}

      <Link className="fab" to="/recipes/new" aria-label="新增菜谱">
        <Plus size={28} />
      </Link>
    </main>
  );
}
