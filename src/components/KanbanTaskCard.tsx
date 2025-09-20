import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/types";

interface KanbanTaskCardProps {
  task: Task;
}

export const KanbanTaskCard = ({ task }: KanbanTaskCardProps) => {
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
        className="p-2.5 bg-primary/10 rounded-xl border-2 border-primary"
      >
        <div className="h-[40px] w-full" />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="p-2.5 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
        <CardContent className="p-0">
          <p className="text-sm">{task.content}</p>
        </CardContent>
      </Card>
    </div>
  );
};