import { ChefHat } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <ChefHat size={42} />
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
