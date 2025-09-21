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

  const gridItems = [];
  domainsWithData.forEach(d => gridItems.push({ type: 'domain', data: d }));
  const placeholdersNeeded = 8 - domainsWithData.length;
  if (placeholdersNeeded > 0) {
    for (let i = 0; i < placeholdersNeeded; i++) {
      gridItems.push({ type: 'add', id: `add-${i}` });
    }
  }

  return (
    <>
      <main className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-12">
        <div className="xs:col-span-2 md:col-auto md:order-5">
          <GoalCard goal={mainGoal} progress={overallProgress} />
        </div>
        {gridItems.map((item, index) => {
          const order = index < 4 ? index + 1 : index + 2;
          if (item.type === 'domain') {
            return (
              <div key={item.data.id} className={`md:order-${order}`}>
                <DomainCard domain={item.data} />
              </div>
            );
          } else {
            return (
              <div key={item.id} className={`md:order-${order}`}>
                <AddDomainCard />
              </div>
            );
          }
        })}
      </main>
      <MadeWithDyad />
    </>
  );
};