import React, { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { format, isPast, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Calendar, Star, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { Task } from '@/types';

export const PrioritizedTasksList = () => {
  const { t, i18n, } = useTranslation();
  const { tasks, domains } = useData();
  const navigate = useNavigate();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const getTaskEffectiveDate = (task: Task): Date | null => {
    if (task.endDate) {
      return parseISO(task.endDate);
    }
    if (task.startDate) {
      return parseISO(task.startDate);
    }
    return null;
  };

  const prioritizedTasks = useMemo(() => {
    return tasks
      .filter(task => task.columnId !== 'done') // Only active tasks
      .sort((a, b) => {
        const dateA = getTaskEffectiveDate(a);
        const dateB = getTaskEffectiveDate(b);

        // 1. Compare by effective date first (earliest first)
        if (dateA && dateB) {
          const timeComparison = dateA.getTime() - dateB.getTime();
          if (timeComparison !== 0) {
            return timeComparison;
          }
        } else if (dateA && !dateB) {
          return -1; // Task A has a date, Task B does not -> A comes first
        } else if (!dateA && dateB) {
          return 1; // Task B has a date, Task A does not -> B comes first
        }
        // If both have no date, or dates are identical, proceed to priority status

        // 2. Compare by priority status (priority first)
        if (a.isPriority && !b.isPriority) return -1; // A is priority, B is not -> A comes first
        if (!a.isPriority && b.isPriority) return 1;  // B is priority, A is not -> B comes first

        // 3. If dates and priority status are identical, sort by content
        return a.content.localeCompare(b.content, i18n.language);
      });
  }, [tasks, i18n.language]);

  const handleTaskClick = (taskId: string, domainId: string) => {
    navigate(`/domain/${domainId}`);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">{t('calendar.prioritizedTasksTitle')}</h2>
      {prioritizedTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prioritizedTasks.map(task => {
            const domain = domains.find(d => d.id === task.domainId);
            const taskEffectiveDate = getTaskEffectiveDate(task);
            const isOverdue = taskEffectiveDate && isPast(taskEffectiveDate) && task.columnId !== 'done';

            return (
              <Card 
                key={task.id} 
                className={cn(
                  "cursor-pointer transition-colors hover:bg-secondary",
                  task.isPriority && "border-l-4 border-red-500",
                  isOverdue && "bg-red-100 dark:bg-red-900/50 border-red-600/50"
                )}
                onClick={() => handleTaskClick(task.id, task.domainId)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    {task.isPriority && <Star className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-400" />}
                    <span className="line-clamp-2">{task.content}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {taskEffectiveDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {task.endDate ? t('common.endDate') : t('common.startDate')}: {format(taskEffectiveDate, 'PPP', { locale: currentLocale })}
                      </span>
                      {isOverdue && (
                        <Badge variant="destructive" className="ml-2">
                          <AlertCircle className="w-3 h-3 mr-1" /> {t('common.overdue')}
                        </Badge>
                      )}
                    </div>
                  )}
                  {domain && (
                    <Badge variant="outline" className="font-normal">
                      {domain.title}
                    </Badge>
                  )}
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {task.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="mt-4">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <Star className="w-16 h-16 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold">{t('calendar.noPrioritizedTasksTitle')}</h3>
            <p className="text-muted-foreground mt-2">{t('calendar.noPrioritizedTasksDescription')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};