import { useData } from "@/contexts/DataContext";
import { GoalWizard } from "@/components/GoalWizard";
import { Dashboard } from "@/components/Dashboard";
import { AdvancedCalendarView } from "@/components/AdvancedCalendarView";
import { MobileCalendarView } from "@/components/MobileCalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { useBreakpoint } from "@/hooks/use-breakpoint";

const Index = () => {
  const { mainGoal } = useData();
  const isMobile = useBreakpoint(414);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!mainGoal) {
    return <GoalWizard />;
  }

  return (
    <div className="min-h-screen text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center">
          <div className="flex-1" />
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2f2f2fcc]">
              Hachieve
            </h1>
            <p className="text-[#2f2f2fcc] mt-4 text-lg">
              8 paths to achievement
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleLogout}
              className="sm:hidden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <Tabs defaultValue="dashboard" className="mt-8">
          <div className="flex justify-center">
            <TabsList className="inline-flex h-auto items-center justify-center rounded-full bg-card/80 p-1.5 backdrop-blur-sm">
              <TabsTrigger value="dashboard" className="rounded-full px-6 py-2 data-[state=active]:bg-[#2f2f2fcc] data-[state=active]:text-white">Tableau de bord</TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-full px-6 py-2 data-[state=active]:bg-[#2f2f2fcc] data-[state=active]:text-white">Calendrier</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="dashboard" className="mt-4">
            <Dashboard />
          </TabsContent>
          <TabsContent value="calendar" className="mt-4">
            {isMobile ? <MobileCalendarView /> : <AdvancedCalendarView />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;