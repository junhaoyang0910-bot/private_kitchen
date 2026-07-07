export type Recipe = {
  id: string;
  name: string;
  category: string;
  imageDataUrl: string;
  ingredients: string[];
  steps: string[];
  notes: string;
  xiaohongshuUrl?: string;
  createdAt: string;
  updatedAt: string;
};
