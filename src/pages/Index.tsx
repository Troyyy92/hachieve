import { useData } from "@/contexts/DataContext";
import { GoalWizard } from "@/components/GoalWizard";
import { Dashboard } from "@/components/Dashboard";
import { CalendarView } from "@/components/CalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { mainGoal } = useData();

  if (!mainGoal) {
    return <GoalWizard />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Mon Plan de Développement
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Votre tableau de bord pour atteindre vos objectifs avec la méthode
            Harada.
          </p>
        </header>

        <Tabs defaultValue="dashboard" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;