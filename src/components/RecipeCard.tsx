import { Link } from "react-router-dom";
import type { Recipe } from "../types/recipe";
import { formatDateTime } from "../utils/date";

type RecipeCardProps = {
  recipe: Recipe;
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link className="recipe-card" to={`/recipes/${recipe.id}`}>
      <img src={recipe.imageDataUrl} alt={recipe.name} />
      <div className="recipe-card__body">
        <div>
          <p className="recipe-card__category">{recipe.category || "未分类"}</p>
          <h2>{recipe.name}</h2>
        </div>
        <p className="recipe-card__date">更新于 {formatDateTime(recipe.updatedAt)}</p>
      </div>
    </Link>
  );
}
