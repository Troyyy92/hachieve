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
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const Index = () => {
  const { mainGoal } = useData();
  const isMobile = useBreakpoint(414);
  const { t } = useTranslation();

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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground/80">
              Hachieve
            </h1>
            <p className="text-foreground/80 mt-4 text-lg">
              8 paths to achievement
            </p>
          </div>
          <div className="flex-1 flex justify-end items-center gap-4">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('common.logout')}
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
            <TabsList className="inline-flex h-auto items-center justify-center rounded-full bg-card/80 p-1.5 backdrop-blur-sm gap-2">
              <TabsTrigger value="dashboard" className="rounded-full px-6 py-2 transition-colors duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('header.dashboard')}</TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-full px-6 py-2 transition-colors duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('header.calendar')}</TabsTrigger>
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