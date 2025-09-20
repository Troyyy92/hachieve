import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const KanbanView = () => {
  const { domainName } = useParams();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary">
          Vue d'ensemble
        </Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="font-medium text-primary capitalize">{domainName}</span>
      </div>

      <h1 className="text-3xl font-bold mb-6 capitalize">
        Tableau Kanban : {domainName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <h2 className="font-semibold mb-4">À faire</h2>
          {/* Les cartes Kanban iront ici */}
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <h2 className="font-semibold mb-4">En cours</h2>
          {/* Les cartes Kanban iront ici */}
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <h2 className="font-semibold mb-4">Terminé</h2>
          {/* Les cartes Kanban iront ici */}
        </div>
      </div>
    </div>
  );
};

export default KanbanView;