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

  const domainsWithData: (Domain & { progress: number; taskCount: number })[] = domains
    .map((domain) => ({
      ...domain,
      progress: calculateProgress(domain.id),
      taskCount: getTaskCount(domain.id),
    }))
    .sort((a, b) => (a.title > b.title ? 1 : -1));

  const totalProgress = domainsWithData.reduce((sum, domain) => sum + domain.progress, 0);
  const overallProgress = domainsWithData.length > 0 ? Math.round(totalProgress / domainsWithData.length) : 0;

  // Desktop layout (3x3 grid)
  const gridCells: JSX.Element[] = Array(9).fill(null);
  gridCells[4] = <GoalCard goal={mainGoal} progress={overallProgress} />;
  let domainIndex = 0;
  for (let i = 0; i < 9; i++) {
    if (i === 4) continue;
    if (domainIndex < domainsWithData.length) {
      const domain = domainsWithData[domainIndex];
      gridCells[i] = <DomainCard key={domain.id} domain={domain} />;
      domainIndex++;
    } else {
      gridCells[i] = <AddDomainCard key={`add-${i}`} />;
    }
  }

  return (
    <>
      {/* Mobile and Tablet Layout */}
      <main className="grid grid-cols-1 xs:grid-cols-2 md:hidden gap-4 md:gap-6 mt-12">
        <div className="xs:col-span-2">
          <GoalCard goal={mainGoal} progress={overallProgress} />
        </div>
        {domainsWithData.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
        {domains.length < 8 && <AddDomainCard />}
      </main>

      {/* Desktop Layout */}
      <main className="hidden md:grid md:grid-cols-3 gap-4 md:gap-6 mt-12">
        {gridCells.map((cell, index) => (
          <div key={index}>{cell}</div>
        ))}
      </main>
      
      <MadeWithDyad />
    </>
  );
};