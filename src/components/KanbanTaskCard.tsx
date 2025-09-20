import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/types";
import { Button } from "./ui/button";
import { Pencil, Trash2, FileText, Calendar } from "lucide-react";

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
        className="aspect-square bg-card rounded-xl border-2 border-primary opacity-50"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
      <Card className="aspect-square flex flex-col justify-between p-3 text-center bg-card hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
        <CardContent className="p-0 flex-grow flex items-center justify-center">
          <p className="text-sm font-medium whitespace-pre-wrap">{task.content}</p>
        </CardContent>
        <div className="flex items-center justify-start gap-2 h-5">
          {task.description && (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
          {(task.startDate || task.endDate) && (
            <Calendar className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
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