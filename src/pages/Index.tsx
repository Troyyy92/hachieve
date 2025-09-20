import { useData } from "@/contexts/DataContext";
import { Welcome } from "@/components/Welcome";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const { mainGoal } = useData();

  if (!mainGoal) {
    return <Welcome />;
  }

  return <Dashboard />;
};

export default Index;