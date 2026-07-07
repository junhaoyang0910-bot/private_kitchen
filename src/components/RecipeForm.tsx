import { useMemo, useState } from "react";
import { placeholderImage } from "../data/mockRecipes";
import type { Recipe } from "../types/recipe";
import ImagePicker from "./ImagePicker";

type RecipeFormProps = {
  mode: "create" | "edit";
  recipe?: Recipe;
  onSubmit: (input: {
    name: string;
    category: string;
    imageDataUrl: string;
    ingredients: string[];
    steps: string[];
    notes: string;
    xiaohongshuUrl?: string;
  }) => void;
};

export default function RecipeForm({ mode, recipe, onSubmit }: RecipeFormProps) {
  const initialIngredients = useMemo(() => recipe?.ingredients.join("\n") ?? "", [recipe]);
  const initialSteps = useMemo(() => recipe?.steps.join("\n") ?? "", [recipe]);
  const [name, setName] = useState(recipe?.name ?? "");
  const [category, setCategory] = useState(recipe?.category ?? "");
  const [imageDataUrl, setImageDataUrl] = useState(recipe?.imageDataUrl ?? placeholderImage);
  const [ingredientsText, setIngredientsText] = useState(initialIngredients);
  const [stepsText, setStepsText] = useState(initialSteps);
  const [notes, setNotes] = useState(recipe?.notes ?? "");
  const [xiaohongshuUrl, setXiaohongshuUrl] = useState(recipe?.xiaohongshuUrl ?? "");
  const [error, setError] = useState("");

  function parseLines(value: string) {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("请先填写菜名。");
      return;
    }

    const normalizedUrl = normalizeUrl(xiaohongshuUrl);
    if (xiaohongshuUrl.trim() && !normalizedUrl) {
      setError("小红书链接格式不正确，请粘贴完整链接。");
      return;
    }

    setError("");
    onSubmit({
      name: trimmedName,
      category: category.trim() || "未分类",
      imageDataUrl,
      ingredients: parseLines(ingredientsText),
      steps: parseLines(stepsText),
      notes: notes.trim(),
      xiaohongshuUrl: normalizedUrl,
    });
  }

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <ImagePicker imageDataUrl={imageDataUrl} onChange={setImageDataUrl} />
      <label>
        菜名
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="例如：番茄炒蛋"
          type="text"
        />
      </label>
      <label>
        分类
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="例如：快手菜、汤、主食"
          type="text"
        />
      </label>
      <label>
        配料
        <textarea
          value={ingredientsText}
          onChange={(event) => setIngredientsText(event.target.value)}
          placeholder="每行一个配料"
          rows={6}
        />
      </label>
      <label>
        步骤
        <textarea
          value={stepsText}
          onChange={(event) => setStepsText(event.target.value)}
          placeholder="每行一个步骤"
          rows={8}
        />
      </label>
      <label>
        备注
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="火候、替换食材、下次调整..."
          rows={4}
        />
      </label>
      <label>
        小红书链接
        <input
          value={xiaohongshuUrl}
          onChange={(event) => setXiaohongshuUrl(event.target.value)}
          placeholder="https://www.xiaohongshu.com/..."
          type="url"
          inputMode="url"
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="primary-button" type="submit">
        {mode === "create" ? "保存菜谱" : "保存修改"}
      </button>
    </form>
  );
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.href;
  } catch {
    return "";
  }
}
