import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Domain } from "@/types";
import { Button } from "./ui/button";
import { Star, Trash2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface DomainCardProps {
  domain: Domain & { progress: number; taskCount: number };
}

export const DomainCard = ({ domain }: DomainCardProps) => {
  const { updateDomain, deleteDomain } = useData();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleTogglePriority = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateDomain(domain.id, { isPriority: !domain.isPriority });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteDomain(domain.id);
    setIsAlertOpen(false);
  };

  return (
    <div className="relative group h-full">
      <Link to={`/domain/${domain.id}`} className="block h-full">
        <Card className={cn(
          "flex flex-col min-h-56 h-full border-none transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1",
          domain.isPriority ? "bg-red-500/20 dark:bg-red-900/40" : "bg-card"
        )}>
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center text-lg">
              <domain.icon className="w-5 h-5 mr-2 text-muted-foreground" />
              {domain.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
            <div className="text-right text-sm text-muted-foreground mb-1">
              {domain.progress}%
            </div>
            <Progress value={domain.progress} />
          </CardContent>
        </Card>
      </Link>
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleTogglePriority}
          aria-label="Toggle priority"
        >
          <Star className={cn("h-5 w-5", domain.isPriority ? "text-yellow-500 fill-yellow-400" : "text-muted-foreground")} />
        </Button>
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDeleteClick}
              aria-label="Delete domain"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce domaine ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le domaine "{domain.title}" sera supprimé définitivement.
                {domain.taskCount > 0 && (
                  <span className="font-bold block mt-2">
                    Attention : {domain.taskCount} tâche(s) associée(s) à ce domaine seront également supprimées.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};