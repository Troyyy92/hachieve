import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { GoalWizard } from "@/components/GoalWizard";
import { Dashboard } from "@/components/Dashboard";
import { AdvancedCalendarView } from "@/components/AdvancedCalendarView";
import { MobileCalendarView } from "@/components/MobileCalendarView";
import { TimelineView } from "@/components/TimelineView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Menu, ChevronDown } from "lucide-react"; 
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AccomplishmentsView } from "@/components/AccomplishmentsView";
import { CompletionModal } from "@/components/CompletionModal";

const Index = () => {
  const { t } = useTranslation();
  const { mainGoal, goalCompletedForModal, setGoalCompletedForModal, completeAndResetProject } = useData();
  const [activeTab, setActiveTab] = useState("dashboard");
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    console.log("Logout button clicked from Index page!"); // Debug log
    await supabase.auth.signOut();
  };

  const getTabTitle = (tabValue: string) => {
    switch (tabValue) {
      case "dashboard":
        return t('index.dashboardTab');
      case "calendar":
        return t('index.calendarTab');
      case "accomplishments":
        return t('index.accomplishmentsTab');
      default:
        return "";
    }
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {t('login.hachieveTitle')}
            </h1>
            <p className="text-foreground mt-4 text-lg">
              {t('login.hachieveSubtitle')}
            </p>
          </div>
          <div className="flex-1 flex justify-end items-center gap-2">
            <div className="hidden md:flex">
              <ThemeToggle />
            </div>
            <div className="hidden md:flex">
              <LanguageSwitcher />
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="hidden md:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('common.logout')}
            </Button>
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center justify-between">
                    <span>{t('common.theme')}</span>
                    <ThemeToggle />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <LanguageSwitcher />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('common.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <div className="flex justify-center">
            <div className="flex sm:hidden w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {getTabTitle(activeTab)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuItem onClick={() => setActiveTab("dashboard")}>
                    {t('index.dashboardTab')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("calendar")}>
                    {t('index.calendarTab')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("accomplishments")}>
                    {t('index.accomplishmentsTab')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <TabsList className="hidden sm:inline-flex h-auto items-center justify-center rounded-full bg-card/80 p-1.5 backdrop-blur-sm gap-2">
              <TabsTrigger value="dashboard" className="rounded-full px-6 py-2 transition-colors duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('index.dashboardTab')}</TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-full px-6 py-2 transition-colors duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('index.calendarTab')}</TabsTrigger>
              <TabsTrigger value="accomplishments" className="rounded-full px-6 py-2 transition-colors duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('index.accomplishmentsTab')}</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="dashboard" className="mt-4">
            <Dashboard />
          </TabsContent>
          <TabsContent value="calendar" className="mt-4">
            <TimelineView />
            {isMobile ? <MobileCalendarView /> : <AdvancedCalendarView />}
          </TabsContent>
          <TabsContent value="accomplishments" className="mt-4">
            <AccomplishmentsView />
          </TabsContent>
        </Tabs>
      </div>
      <CompletionModal
        isOpen={!!goalCompletedForModal}
        onOpenChange={(open) => !open && setGoalCompletedForModal(null)}
        goal={goalCompletedForModal}
        onContinue={() => setGoalCompletedForModal(null)}
        onNewGoal={completeAndResetProject}
      />
    </div>
  );
};

export default Index;