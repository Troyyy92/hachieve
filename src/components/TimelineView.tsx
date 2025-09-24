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

  // Helper function to determine the priority level of a task
  const getTaskPriorityLevel = (task: Task): number => {
    const hasEndDate = !!task.endDate;
    const hasStartDate = !!task.startDate;
    const isPriority = !!task.isPriority;

    if (isPriority && hasEndDate) return 1;
    if (isPriority && hasStartDate && !hasEndDate) return 2;
    if (isPriority && !hasStartDate && !hasEndDate) return 3;
    if (!isPriority && hasEndDate) return 4;
    if (!isPriority && hasStartDate && !hasEndDate) return 5;
    if (!isPriority && !hasStartDate && !hasEndDate) return 6;
    return 6; // Fallback, though all cases should be covered
  };

  const prioritizedTasks = useMemo(() => {
    return tasks
      .filter(task => task.columnId !== 'done') // Only active tasks
      .sort((a, b) => {
        const priorityA = getTaskPriorityLevel(a);
        const priorityB = getTaskPriorityLevel(b);

        // Primary sort: by defined priority level
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Secondary sort: within the same priority level
        // For levels 1 and 4 (has endDate): sort by endDate (closest first)
        if (priorityA === 1 || priorityA === 4) {
          const endDateA = a.endDate ? parseISO(a.endDate).getTime() : Infinity;
          const endDateB = b.endDate ? parseISO(b.endDate).getTime() : Infinity;
          if (endDateA !== endDateB) {
            return endDateA - endDateB;
          }
        }
        // For levels 2 and 5 (has startDate but no endDate): sort by startDate (earliest first)
        else if (priorityA === 2 || priorityA === 5) {
          const startDateA = a.startDate ? parseISO(a.startDate).getTime() : Infinity;
          const startDateB = b.startDate ? parseISO(b.startDate).getTime() : Infinity;
          if (startDateA !== startDateB) {
            return startDateA - startDateB;
          }
        }

        // Tertiary sort: alphabetical by content if all else is equal
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
            const taskEndDate = task.endDate ? parseISO(task.endDate) : null;
            const isOverdue = taskEndDate && isPast(taskEndDate) && task.columnId !== 'done';

            return (
              <div key={task.id} className="flex-shrink-0 w-[150px]"> {/* Fixed width for timeline cards */}
                <KanbanTaskCard
                  task={task}
                  onView={handleOpenTaskDetails}
                  onEdit={handleOpenTaskDetails}
                  onDelete={handleDeleteTask}
                  onDuplicate={handleDuplicateTask}
                  onTogglePriority={handleTogglePriority}
                  taskEndDate={taskEndDate}
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