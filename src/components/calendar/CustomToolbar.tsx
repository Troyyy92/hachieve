import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ToolbarProps } from 'react-big-calendar';
import { useTranslation } from "react-i18next";

export const CustomToolbar = (toolbar: ToolbarProps) => {
  const { t } = useTranslation();

  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const handleViewChange = (view: string) => {
    toolbar.onView(view as any);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={goToBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={goToCurrent}>{t('common.today')}</Button>
        <Button variant="outline" size="icon" onClick={goToNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <h2 className="text-xl font-semibold text-center">
        {toolbar.label}
      </h2>
      <Tabs value={toolbar.view} onValueChange={handleViewChange} className="w-full sm:w-auto">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="month">{t('calendar.month')}</TabsTrigger>
          <TabsTrigger value="week">{t('calendar.week')}</TabsTrigger>
          <TabsTrigger value="day">{t('calendar.day')}</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};