import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/types";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface KanbanTaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const KanbanTaskCard = ({ task, onDelete, onEdit }: KanbanTaskCardProps) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="aspect-square bg-primary/10 rounded-xl border-2 border-primary"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
      <Card className="aspect-square flex items-center justify-center p-3 text-center bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-900/50 hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing transform hover:-rotate-1">
        <CardContent className="p-0">
          <p className="text-sm font-medium whitespace-pre-wrap">{task.content}</p>
        </CardContent>
      </Card>
      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(task.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};