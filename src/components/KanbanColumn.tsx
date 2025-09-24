import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useMemo } from "react";
import { Column, Task } from "@/types";
import { KanbanTaskCard } from "./KanbanTaskCard";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (taskId: string) => void;
  onTogglePriorityTask: (task: Task) => void;
}

export const KanbanColumn = ({ column, tasks, onViewTask, onEditTask, onDeleteTask, onDuplicateTask, onTogglePriorityTask }: KanbanColumnProps) => {
  const { t } = useTranslation();
  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const { theme } = useTheme();

  // Explicitly check if column is valid before proceeding
  // This ensures 'column' is not undefined/null and 'column.id' is also not undefined/null
  if (!column || typeof column.id === 'undefined' || column.id === null) {
    console.error("Erreur: La prop 'column' ou 'column.id' est invalide dans KanbanColumn.", column);
    return (
      <div className="rounded-lg p-4 flex flex-col gap-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
        <h2 className="font-semibold">{t('common.error')}</h2>
        <p>{t('common.loadingError')}</p>
      </div>
    );
  }

  // At this point, 'column' and 'column.id' are guaranteed to be valid
  const sortableId = column.id; 

  const { setNodeRef } = useSortable({
    id: sortableId,
    data: {
      type: "Column",
      column: column, // 'column' is guaranteed to be valid here
    },
  });

  return (
    <div ref={setNodeRef} className={cn(
      "rounded-lg p-4 flex flex-col gap-4",
      theme === "dark" ? "bg-dark-kanban-column" : "bg-[#f4f4f4]"
    )}>
      <h2 className="font-semibold px-1">{column.title} <span className="text-muted-foreground font-normal">({tasks.length})</span></h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow xl-custom:flex xl-custom:flex-wrap xl-custom:gap-x-4 xl-custom:gap-y-4 xl-custom:justify-start">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <KanbanTaskCard 
              key={task.id} 
              task={task} 
              onView={onViewTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onDuplicate={onDuplicateTask}
              onTogglePriority={onTogglePriorityTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};