import React, { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from './ui/card';
import { format, isPast, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Star } from 'lucide-react';
import { KanbanTaskCard } from './KanbanTaskCard';
import { TaskDetailsModal } from './TaskDetailsModal';
import { ColumnId, Column, Task } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TimelineView = () => {
  const { t, i18n } = useTranslation();
  const { tasks, domains, updateTask, deleteTask, duplicateTask } = useData();
  const [taskToEditOrView, setTaskToEditOrView] = useState<Task | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null); // New state for delete confirmation

  const columns: Column[] = useMemo(() => [
    { id: "todo", title: t('kanban.todoColumn') },
    { id: "inprogress", title: t('kanban.inProgressColumn') },
    { id: "done", title: t('kanban.doneColumn') },
  ], [t]);

  const getColumnTitle = (columnId: ColumnId) => {
    const column = columns.find(col => col.id === columnId);
    return column ? column.title : '';
  };

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

  const handleOpenTaskDetails = (task: Task) => {
    setTaskToEditOrView(task);
  };

  const handleTogglePriority = (task: Task) => {
    updateTask(task.id, { isPriority: !task.isPriority });
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDeleteId(taskId); // Open confirmation dialog
  };

  const handleConfirmDelete = () => {
    if (taskToDeleteId) {
      deleteTask(taskToDeleteId);
      setTaskToDeleteId(null);
    }
  };

  const handleDuplicateTask = (taskId: string) => {
    duplicateTask(taskId);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">{t('calendar.prioritizedTasksTitle')}</h2>
      {prioritizedTasks.length > 0 ? (
        <div className="flex overflow-x-auto space-x-4 p-4 -mx-4 sm:-mx-8 lg:-mx-12 custom-scrollbar">
          {prioritizedTasks.map(task => {
            const domain = domains.find(d => d.id === task.domainId);
            const taskEffectiveDate = getTaskEffectiveDate(task);
            const isOverdue = taskEffectiveDate && isPast(taskEffectiveDate) && task.columnId !== 'done';

            return (
              <div key={task.id} className="flex-shrink-0 w-[150px]"> {/* Fixed width for timeline cards */}
                <KanbanTaskCard
                  task={task}
                  onView={handleOpenTaskDetails}
                  onEdit={handleOpenTaskDetails}
                  onDelete={handleDeleteTask}
                  onDuplicate={handleDuplicateTask}
                  onTogglePriority={handleTogglePriority}
                  taskEndDate={taskEffectiveDate} // Pass effective date for display
                  isOverdue={isOverdue}
                  domainTitle={domain?.title}
                />
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

      <AlertDialog open={!!taskToDeleteId} onOpenChange={() => setTaskToDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('kanban.taskDeleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('kanban.taskDeleteConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};