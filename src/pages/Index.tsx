import { DomainCard } from "@/components/DomainCard";
import { GoalCard } from "@/components/GoalCard";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useData } from "@/contexts/DataContext";
import { Domain } from "@/types";

const Index = () => {
  const { domains, tasks, mainGoal } = useData();

  const calculateProgress = (domainId: string) => {
    const domainTasks = tasks.filter((task) => task.domainId === domainId);
    if (domainTasks.length === 0) return 0;
    const completedTasks = domainTasks.filter(
      (task) => task.columnId === "done"
    ).length;
    return Math.round((completedTasks / domainTasks.length) * 100);
  };

  const domainsWithProgress: (Domain & { progress: number })[] = domains.map(
    (domain) => ({
      ...domain,
      progress: calculateProgress(domain.id),
    })
  );

  const firstHalf = domainsWithProgress.slice(0, 4);
  const secondHalf = domainsWithProgress.slice(4);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Mon Plan de Développement
          </h1>
          <p className="text-muted-foreground mt-2">
            Votre tableau de bord pour atteindre vos objectifs avec la méthode
            Harada.
          </p>
        </header>

        <main className="grid grid-cols-3 gap-4 md:gap-6">
          {firstHalf.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
          <GoalCard title={mainGoal} />
          {secondHalf.map((domain) => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </main>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;