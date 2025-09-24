import { DomainCard } from "@/components/DomainCard";
import { GoalCard } from "@/components/GoalCard";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useData } from "@/contexts/DataContext";
import { Domain } from "@/types";
import { AddDomainCard } from "./AddDomainCard";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useBreakpoint } from "@/hooks/use-breakpoint"; // Import du hook useBreakpoint
import { useMemo } from "react"; // Import de useMemo

export const Dashboard = () => {
  const { t } = useTranslation();
  const { domains, tasks, mainGoal, calculateOverallProgress, completeAndResetProject } = useData();
  const isBelowXs = useBreakpoint(414); // Détecte si l'écran est inférieur à 414px

  if (!mainGoal) return null;

  const calculateProgress = (domainId: string) => {
    const domainTasks = tasks.filter((task) => task.domainId === domainId);
    if (domainTasks.length === 0) return 0;
    const completedTasks = domainTasks.filter(
      (task) => task.columnId === "done"
    ).length;
    return Math.round((completedTasks / domainTasks.length) * 100);
  };

  const getTaskCount = (domainId: string) => {
    return tasks.filter((task) => task.domainId === domainId).length;
  };

  const domainsWithData: (Domain & { progress: number; taskCount: number })[] = useMemo(() => {
    return domains.map((domain) => ({
      ...domain,
      progress: calculateProgress(domain.id),
      taskCount: getTaskCount(domain.id),
    }));
  }, [domains, tasks]); // Dépendances pour useMemo

  // Trier les domaines : prioritaires d'abord, puis par ordre alphabétique (uniquement sur mobile)
  const sortedDomains = useMemo(() => {
    let currentDomains = [...domainsWithData];
    if (isBelowXs) {
      // Tri par priorité d'abord, puis alphabétique pour les petits écrans
      currentDomains.sort((a, b) => {
        if (a.isPriority && !b.isPriority) return -1;
        if (!a.isPriority && b.isPriority) return 1;
        return a.title.localeCompare(b.title);
      });
    } else {
      // Tri uniquement alphabétique pour les grands écrans
      currentDomains.sort((a, b) => a.title.localeCompare(b.title));
    }
    return currentDomains;
  }, [domainsWithData, isBelowXs]); // Dépendances pour useMemo

  const overallProgress = calculateOverallProgress(domains, tasks);
  const showNewGoalButton = overallProgress === 100;

  const renderCards = () => {
    const cards: JSX.Element[] = [];
    const goalCard = <GoalCard key="main-goal" goal={mainGoal} progress={overallProgress} />;

    // Préparer toutes les cartes de domaine (y compris les cartes "Ajouter un domaine")
    const domainAndAddCards: JSX.Element[] = [];
    sortedDomains.forEach(domain => domainAndAddCards.push(<DomainCard key={domain.id} domain={domain} />));

    const currentDomainCount = domainsWithData.length;
    const maxAddCards = 8 - currentDomainCount;
    for (let i = 0; i < maxAddCards; i++) {
      domainAndAddCards.push(<AddDomainCard key={`add-${i}`} />);
    }

    if (isBelowXs) {
      // Disposition mobile (écrans < 414px) : Objectif principal en haut, puis les domaines
      cards.push(goalCard);
      cards.push(...domainAndAddCards);
    } else {
      // Disposition desktop/tablet (écrans >= 414px) : Objectif principal au centre d'une grille 3x3
      // La position centrale est l'index 4 (0-indexé)
      
      // Ajouter les 4 premières cartes de domaine/ajout
      for (let i = 0; i < 4 && i < domainAndAddCards.length; i++) {
        cards.push(domainAndAddCards[i]);
      }
      
      // Insérer la carte de l'objectif principal
      cards.push(goalCard);

      // Ajouter le reste des cartes de domaine/ajout
      for (let i = 4; i < domainAndAddCards.length; i++) {
        cards.push(domainAndAddCards[i]);
      }
    }

    return cards;
  };

  return (
    <>
      {showNewGoalButton && (
        <div className="text-center mb-8">
          <Button 
            onClick={completeAndResetProject}
            className="text-lg px-8 py-6"
          >
            <Plus className="h-5 w-5 mr-3" />
            {t('index.createNewGoalButton')}
          </Button>
        </div>
      )}

      <main className="grid grid-cols-1 xs:grid-cols-3 gap-2 mt-12 max-w-full xs:max-w-[376px] sm:max-w-[616px] mx-auto">
        {renderCards().map((card, index) => (
          <div key={index}>{card}</div>
        ))}
      </main>
      
      <MadeWithDyad />
    </>
  );
};