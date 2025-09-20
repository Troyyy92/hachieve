import { useData } from "@/contexts/DataContext";
import { GoalWizard } from "@/components/GoalWizard";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const { mainGoal } = useData();

  if (!mainGoal) {
    return <GoalWizard />;
  }

  return <Dashboard />;
};

export default Index;