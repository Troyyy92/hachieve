import { DomainCard } from "@/components/DomainCard";
import { GoalCard } from "@/components/GoalCard";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useData } from "@/contexts/DataContext";
import { Domain } from "@/types";

export const Dashboard = () => {
  const { domains, tasks, mainGoal } = useData();

  // This component is only rendered when mainGoal is not null,
  // but we add a check to satisfy TypeScript and prevent potential errors.
  if (!mainGoal) return null;

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

  const totalProgress = domainsWithProgress.reduce((sum, domain) => sum + domain.progress, 0);
  const overallProgress = domainsWithProgress.length > 0 ? Math.round(totalProgress / domainsWithProgress.length) : 0;

  const firstHalf = domainsWithProgress.slice(0, 4);
  const secondHalf = domainsWithProgress.slice(4);

  return (
    <>
      {/* Mobile Layout (under 414px) */}
      <main className="xs:hidden flex flex-col gap-4 mt-12">
        <GoalCard goal={mainGoal} progress={overallProgress} />
        {domainsWithProgress.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </main>

      {/* Desktop Layout (414px and up) */}
      <main className="hidden xs:grid grid-cols-3 gap-4 md:gap-6 mt-12">
        {firstHalf.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
        <GoalCard goal={mainGoal} progress={overallProgress} />
        {secondHalf.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </main>
      <MadeWithDyad />
    </>
  );
};