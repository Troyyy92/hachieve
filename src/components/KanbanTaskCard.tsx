import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/types";
import { FileText, Calendar, Star, MoreVertical, Pencil, Trash2, Copy } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; 
import { useTranslation } from "react-i18next";

interface KanbanTaskCardProps {
  task: Task;
  onView: (task: Task) => void; // Now used for the main card click
  onEdit: (task: Task) => void; // Still used for dropdown edit
  onDelete: (taskId: string) => void; // Still used for dropdown delete
  onDuplicate: (taskId: string) => void; // Still used for dropdown duplicate
  onTogglePriority: (task: Task) => void; // Still used for dropdown toggle priority
}

export const KanbanTaskCard = ({ task, onView, onEdit, onDelete, onDuplicate, onTogglePriority }: KanbanTaskCardProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isMobile = useIsMobile(); 
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
        className="w-full aspect-square bg-card rounded-xl border-2 border-primary opacity-50 xl-custom:w-[150px]" 
      />
    );
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onEdit(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(task.id);
  };

  const handleTogglePriorityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePriority(task);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group cursor-pointer">
      <Card className={cn(
        "w-full aspect-square flex flex-col justify-between p-3 text-center hover:shadow-md transition-shadow border-none xl-custom:w-[150px] relative", 
        theme === "dark"
          ? (task.isPriority ? "bg-dark-task-priority" : "bg-dark-task-card")
          : (task.isPriority ? "bg-[#ff93936b]" : "bg-card"),
        task.columnId === 'done' && "opacity-70"
      )} onClick={() => onView(task)}> 
        <CardContent className="p-0 flex-grow flex items-center justify-center">
          <p className={cn(
            "text-sm font-medium whitespace-pre-wrap line-clamp-3",
            task.columnId === 'done' && "line-through text-muted-foreground"
          )}>
            {task.content}
          </p>
        </CardContent>
        <div className="flex items-center justify-start gap-2 h-5">
          {task.description && (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
          {(task.startDate || task.endDate) && (
            <Calendar className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="absolute top-1 right-1 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">{t('common.actions')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Pencil className="mr-2 h-4 w-4" /> {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicateClick}>
                <Copy className="mr-2 h-4 w-4" /> {t('common.copy')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTogglePriorityClick}>
                <Star className={cn("mr-2 h-4 w-4", task.isPriority ? "text-yellow-500 fill-yellow-400" : "")} />
                {task.isPriority ? t('common.removePriority') : t('common.addPriority')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </div>
  );
};