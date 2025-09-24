import React, { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from './ui/card';
import { format, isPast, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Calendar, Star, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { KanbanTaskCard } from './KanbanTaskCard';
import { TaskDetailsModal } from './TaskDetailsModal';
import { ColumnId, Column } from '@/types';

export const TimelineView = () => {
  const { t, i18n } = useTranslation();
  const { tasks, domains } = useData();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const [taskToEditOrView, setTaskToEditOrView] = useState<Task | null>(null);

  const columns: Column[] = useMemo(() => [
    { id: "todo", title: t('kanban.todoColumn') },
    { id: "inprogress", title: t('kanban.inProgressColumn') },
    { id: "done", title: t('kanban.doneColumn') },
  ], [t]);

  const getColumnTitle = (columnId: ColumnId) => {
    const column = columns.find(col => col.id === columnId);
    return column ? column.title : '';
  };

  const prioritizedTasks = useMemo(() => {
    return tasks
      .filter(task => task.columnId !== 'done') // Only active tasks
      .sort((a, b) => {
        // 1. Sort by endDate (closest first)
        const endDateA = a.endDate ? parseISO(a.endDate).getTime() : Infinity;
        const endDateB = b.endDate ? parseISO(b.endDate).getTime() : Infinity;

        if (endDateA !== endDateB) {
          return endDateA - endDateB;
        }

        // 2. If endDate is the same (or both are null/Infinity), sort by priority (priority first)
        if (a.isPriority && !b.isPriority) return -1;
        if (!a.isPriority && b.isPriority) return 1;

        // 3. Fallback to startDate (earliest first)
        const startDateA = a.startDate ? parseISO(a.startDate).getTime() : Infinity;
        const startDateB = b.startDate ? parseISO(b.startDate).getTime() : Infinity;

        if (startDateA !== startDateB) {
          return startDateA - startDateB;
        }

        // 4. Finally, sort alphabetically by content
        return a.content.localeCompare(b.content, i18n.language);
      });
  }, [tasks, i18n.language]);

  const handleOpenTaskDetails = (task: Task) => {
    setTaskToEditOrView(task);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">{t('calendar.prioritizedTasksTitle')}</h2>
      {prioritizedTasks.length > 0 ? (
        <div className="flex overflow-x-auto space-x-4 p-4 -mx-4 sm:-mx-8 lg:-mx-12 custom-scrollbar">
          {prioritizedTasks.map(task => {
            const domain = domains.find(d => d.id === task.domainId);
            const taskEndDate = task.endDate ? parseISO(task.endDate) : null;
            const isOverdue = taskEndDate && isPast(taskEndDate) && task.columnId !== 'done';

            return (
              <div key={task.id} className="flex-shrink-0 w-[150px]"> {/* Fixed width for timeline cards */}
                <KanbanTaskCard
                  task={task}
                  onView={handleOpenTaskDetails}
                  onEdit={handleOpenTaskDetails}
                  onDelete={() => {}} // Handled by TaskDetailsModal
                  onDuplicate={() => {}} // Handled by TaskDetailsModal
                  onTogglePriority={() => {}} // Handled by TaskDetailsModal
                />
                {taskEndDate && (
                  <div className={cn(
                    "flex items-center text-xs mt-2 px-1",
                    isOverdue ? "text-destructive" : "text-muted-foreground"
                  )}>
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{format(taskEndDate, 'PPP', { locale: currentLocale })}</span>
                    {isOverdue && (
                      <Badge variant="destructive" className="ml-1 px-1 py-0.5 text-[0.6rem]">
                        <AlertCircle className="w-2.5 h-2.5 mr-0.5" /> {t('common.overdue')}
                      </Badge>
                    )}
                  </div>
                )}
                {domain && (
                  <Badge variant="outline" className="mt-1 ml-1 font-normal text-[0.6rem] px-1 py-0.5">
                    {domain.title}
                  </Badge>
                )}
              </div>
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

      <TaskDetailsModal
        isOpen={!!taskToEditOrView}
        onOpenChange={(open) => !open && setTaskToEditOrView(null)}
        task={taskToEditOrView}
        columns={columns}
        getColumnTitle={getColumnTitle}
      />
    </div>
  );
};