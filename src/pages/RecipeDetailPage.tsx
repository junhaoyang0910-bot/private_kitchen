import { Edit, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import { useRecipes } from "../context/RecipeContext";
import { formatDateTime } from "../utils/date";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteRecipe, getRecipeById, isLoading, storageError } = useRecipes();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const recipe = id ? getRecipeById(id) : undefined;

  if (isLoading) {
    return (
      <main className="page">
        <AppHeader title="菜谱详情" showBack />
        <section className="detail-section">
          <p>正在读取菜谱...</p>
        </section>
      </main>
    );
  }

  if (!recipe) {
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

  function handleConfirmDelete() {
    if (!recipe) {
      return;
    }
    deleteRecipe(recipe.id);
    navigate("/");
  }

  return (
    <main className="page">
      <AppHeader title="菜谱详情" showBack />
      {storageError ? <p className="notice notice--error">{storageError}</p> : null}
      <article className="recipe-detail">
        <img className="recipe-detail__image" src={recipe.imageDataUrl} alt={recipe.name} />
        <div className="recipe-detail__title-row">
          <div>
            <p className="eyebrow">{recipe.category || "未分类"}</p>
            <h2>{recipe.name}</h2>
          </div>
          <div className="detail-actions">
            <Link className="icon-button" to={`/recipes/${recipe.id}/edit`} aria-label="编辑菜谱" title="编辑菜谱">
              <Edit size={20} />
            </Link>
            <button
              className="icon-button icon-button--danger"
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              aria-label="删除菜谱"
              title="删除菜谱"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <section className="detail-section">
          <h3>配料</h3>
          <ul>
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </section>

        <section className="detail-section">
          <h3>大致步骤</h3>
          <ol>
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {recipe.notes ? (
          <section className="detail-section">
            <h3>备注</h3>
            <p>{recipe.notes}</p>
          </section>
        ) : null}

        {recipe.xiaohongshuUrl ? (
          <section className="detail-section">
            <h3>参考链接</h3>
            <a
              className="external-link-button"
              href={recipe.xiaohongshuUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={18} />
              打开小红书
            </a>
          </section>
        ) : null}

        <section className="detail-meta">
          <p>创建时间：{formatDateTime(recipe.createdAt)}</p>
          <p>更新时间：{formatDateTime(recipe.updatedAt)}</p>
        </section>
      </article>
      {isDeleteOpen ? (
        <ConfirmDialog
          title="删除这道菜？"
          description="删除后这条菜谱会从当前列表移除。接入本地数据库后，也会同步删除本地保存的数据。"
          confirmText="删除"
          onCancel={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </main>
  );
}
