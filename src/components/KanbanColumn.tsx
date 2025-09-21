import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useMemo } from "react";
import { Column, Task } from "@/types";
import { KanbanTaskCard } from "./KanbanTaskCard";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

export const KanbanColumn = ({ column, tasks, onDeleteTask, onEditTask }: KanbanColumnProps) => {
  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div ref={setNodeRef} className="bg-card/50 rounded-lg p-4 flex flex-col gap-4">
      <h2 className="font-semibold px-1">{column.title} <span className="text-muted-foreground font-normal">({tasks.length})</span></h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <KanbanTaskCard key={task.id} task={task} onDelete={onDeleteTask} onEdit={onEditTask} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};