import { ArrowLeft, Database } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type AppHeaderProps = {
  title: string;
  showBack?: boolean;
  showBackup?: boolean;
};

export default function AppHeader({ title, showBack = false, showBackup = false }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="app-header__side">
        {showBack ? (
          <button className="icon-button" type="button" onClick={() => navigate(-1)} aria-label="返回" title="返回">
            <ArrowLeft size={21} />
          </button>
        ) : null}
      </div>
      <h1>{title}</h1>
      <div className="app-header__side app-header__side--right">
        {showBackup ? (
          <Link className="icon-button" to="/backup" aria-label="数据备份" title="数据备份">
            <Database size={20} />
          </Link>
        ) : null}
      </div>
    </header>
  );
}
