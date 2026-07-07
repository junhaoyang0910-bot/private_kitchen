import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import RecipeFormPage from "./pages/RecipeFormPage";
import BackupPage from "./pages/BackupPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/recipes/new" element={<RecipeFormPage mode="create" />} />
      <Route path="/recipes/:id" element={<RecipeDetailPage />} />
      <Route path="/recipes/:id/edit" element={<RecipeFormPage mode="edit" />} />
      <Route path="/backup" element={<BackupPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
