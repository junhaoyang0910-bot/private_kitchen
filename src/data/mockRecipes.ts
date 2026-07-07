import type { Recipe } from "../types/recipe";

export const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f1e8dc'/%3E%3Ccircle cx='400' cy='270' r='115' fill='%23d98b5f'/%3E%3Cpath d='M210 430h380' stroke='%23845d45' stroke-width='28' stroke-linecap='round'/%3E%3Cpath d='M290 210c38-42 88-64 150-50 48 11 83 43 104 94' fill='none' stroke='%23fff8ef' stroke-width='24' stroke-linecap='round'/%3E%3C/svg%3E";

export const mockRecipes: Recipe[] = [
  {
    id: "mapo-tofu",
    name: "家常麻婆豆腐",
    category: "下饭菜",
    imageDataUrl: placeholderImage,
    ingredients: ["嫩豆腐 1 盒", "牛肉末 80g", "豆瓣酱 1 勺", "花椒粉 少许", "葱花 少许"],
    steps: ["豆腐切块，热水中轻轻焯一下。", "锅中炒香肉末和豆瓣酱。", "加入清水和豆腐，小火煮入味。", "收汁后撒花椒粉和葱花。"],
    notes: "豆腐下锅后少翻动，用锅铲轻推更完整。",
    createdAt: "2026-06-12T10:10:00.000Z",
    updatedAt: "2026-06-28T13:30:00.000Z",
  },
  {
    id: "tomato-egg",
    name: "番茄炒蛋",
    category: "快手菜",
    imageDataUrl: placeholderImage,
    ingredients: ["番茄 2 个", "鸡蛋 3 个", "盐 少许", "糖 少许"],
    steps: ["鸡蛋打散，先炒至凝固盛出。", "番茄炒出汁，加盐和一点糖。", "倒回鸡蛋，快速翻匀出锅。"],
    notes: "番茄去皮后口感更细，也可以保留一点块状。",
    createdAt: "2026-05-02T08:20:00.000Z",
    updatedAt: "2026-06-20T11:05:00.000Z",
  },
  {
    id: "chicken-soup",
    name: "香菇鸡汤",
    category: "汤",
    imageDataUrl: placeholderImage,
    ingredients: ["鸡腿 2 个", "干香菇 8 朵", "姜片 3 片", "盐 适量"],
    steps: ["干香菇提前泡发。", "鸡腿焯水后冲洗干净。", "加入香菇、姜片和热水炖煮。", "出锅前加盐调味。"],
    notes: "泡香菇的水沉淀过滤后可以加入汤里，味道更浓。",
    createdAt: "2026-04-15T12:00:00.000Z",
    updatedAt: "2026-06-10T12:00:00.000Z",
  },
];
