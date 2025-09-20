import { Link, useParams } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Column, ColumnId, Task } from "@/types";
import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanTaskCard } from "@/components/KanbanTaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useData } from "@/contexts/DataContext";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const initialColumns: Column[] = [
  { id: "todo", title: "À faire" },
  { id: "inprogress", title: "En cours" },
  { id: "done", title: "Terminé" },
];

const KanbanView = () => {
  const { domainId } = useParams();
  const { domains, tasks, setTasks, addTask, updateTask, deleteTask } = useData();
  const domain = domains.find(d => d.id === domainId);

  const [columns] = useState<Column[]>(initialColumns);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const domainTasks = useMemo(() => tasks.filter(task => task.domainId === domainId), [tasks, domainId]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newTaskContent, setNewTaskContent] = useState("");
  
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleAddTask = () => {
    if (!newTaskContent.trim() || !domainId) return;
    addTask(newTaskContent.trim(), domainId);
    setNewTaskContent("");
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const handleOpenEditDialog = (task: Task) => {
    setTaskToEdit(task);
    setEditedContent(task.content);
  };

  const handleUpdateTask = () => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, editedContent);
      setTaskToEdit(null);
      setEditedContent("");
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setTasks((currentTasks) => {
      const activeTask = currentTasks.find((t) => t.id === activeId);
      const overTask = currentTasks.find((t) => t.id === overId);

      if (!activeTask) return currentTasks;

      const activeIndex = currentTasks.findIndex((t) => t.id === activeId);

      if (overTask) {
        const overIndex = currentTasks.findIndex((t) => t.id === overId);
        if (activeTask.columnId !== overTask.columnId) {
          const newTasks = [...currentTasks];
          newTasks[activeIndex] = { ...activeTask, columnId: overTask.columnId };
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(currentTasks, activeIndex, overIndex);
      }

      const isOverAColumn = over.data.current?.type === "Column";
      if (isOverAColumn) {
        if (activeTask.columnId !== overId) {
          const newTasks = [...currentTasks];
          newTasks[activeIndex] = { ...activeTask, columnId: overId as ColumnId };
          return newTasks;
        }
      }

      return currentTasks;
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary">
          Vue d'ensemble
        </Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="font-medium text-primary capitalize">{domain?.title}</span>
      </div>

      <h1 className="text-3xl font-bold mb-2 capitalize">
        Tableau Kanban : {domain?.title}
      </h1>
      <div className="mb-6">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Nouvelle tâche..."
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <Button type="submit" onClick={handleAddTask}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SortableContext items={columnsId}>
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={domainTasks.filter((task) => task.columnId === col.id)}
                onDeleteTask={setTaskToDelete}
                onEditTask={handleOpenEditDialog}
              />
            ))}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeTask && <KanbanTaskCard task={activeTask} onDelete={() => {}} onEdit={() => {}} />}
        </DragOverlay>
      </DndContext>

      <Dialog open={!!taskToEdit} onOpenChange={() => setTaskToEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier la tâche</DialogTitle></DialogHeader>
          <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="min-h-[100px]" />
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
            <Button type="button" onClick={handleUpdateTask}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible. La tâche sera supprimée définitivement.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KanbanView;