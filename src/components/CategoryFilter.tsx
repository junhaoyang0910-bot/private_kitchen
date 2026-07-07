type CategoryFilterProps = {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
};

export default function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  return (
    <div className="category-filter" aria-label="分类筛选">
      <button className={value === "全部" ? "is-active" : ""} type="button" onClick={() => onChange("全部")}>
        全部
      </button>
      {categories.map((category) => (
        <button
          className={value === category ? "is-active" : ""}
          key={category}
          type="button"
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
