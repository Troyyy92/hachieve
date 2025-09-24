import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { differenceInDays, format, parseISO } from "date-fns";
import { fr, enUS } from 'date-fns/locale';
import { Calendar, CheckCircle2, LayoutGrid, ListChecks } from "lucide-react"; // Ajout de LayoutGrid et ListChecks
import { useTranslation } from "react-i18next";
import { MainGoal } from "@/contexts/DataContext";

interface AccomplishmentCardProps {
  goal: MainGoal;
}

export const AccomplishmentCard = ({ goal }: AccomplishmentCardProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const completionDate = goal.completed_at ? format(parseISO(goal.completed_at), 'PPP', { locale: currentLocale }) : null;
  const startDate = parseISO(goal.created_at);
  const endDate = goal.completed_at ? parseISO(goal.completed_at) : new Date();
  const diff = differenceInDays(endDate, startDate);
  const duration = diff >= 0 ? diff + 1 : 1;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-green-500/30 border-2">
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-6 h-6 mr-3" />
          {goal.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {completionDate && (
          <div className="flex items-center text-sm">
            <Calendar className="w-5 h-5 mr-3 text-muted-foreground" />
            <span>{t('accomplishments.completedOn', { date: completionDate })}</span>
          </div>
        )}
        {duration !== null && (
          <div className="flex items-center text-sm">
            <Calendar className="w-5 h-5 mr-3 text-muted-foreground" />
            <span>{t('accomplishments.duration', { count: duration })}</span>
          </div>
        )}
        {goal.domain_count !== undefined && (
          <div className="flex items-center text-sm">
            <LayoutGrid className="w-5 h-5 mr-3 text-muted-foreground" />
            <span>{t('accomplishments.domainCount', { count: goal.domain_count })}</span>
          </div>
        )}
        {goal.task_count !== undefined && (
          <div className="flex items-center text-sm">
            <ListChecks className="w-5 h-5 mr-3 text-muted-foreground" />
            <span>{t('accomplishments.taskCount', { count: goal.task_count })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};