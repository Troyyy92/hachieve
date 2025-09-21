import { DomainCard } from "@/components/DomainCard";
import { GoalCard } from "@/components/GoalCard";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useData } from "@/contexts/DataContext";
import { Domain } from "@/types";
import { AddDomainCard } from "./AddDomainCard";

export const Dashboard = () => {
  const { domains, tasks, mainGoal } = useData();

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

  const domainsWithData: (Domain & { progress: number; taskCount: number })[] = domains.map(
    (domain) => ({
      ...domain,
      progress: calculateProgress(domain.id),
      taskCount: getTaskCount(domain.id),
    })
  );

  const totalProgress = domainsWithData.reduce((sum, domain) => sum + domain.progress, 0);
  const overallProgress = domainsWithData.length > 0 ? Math.round(totalProgress / domainsWithData.length) : 0;

  return (
    <>
      <main className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-12">
        <GoalCard goal={mainGoal} progress={overallProgress} />
        {domainsWithData.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
        {domains.length < 8 && <AddDomainCard />}
      </main>
      <MadeWithDyad />
    </>
  );
};