import { Link, useParams } from "react-router-dom";
import { ChevronRight, Plus, Pencil, Calendar as CalendarIcon } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const initialColumns: Column[] = [
  { id: "todo", title: "À faire" },
  { id: "inprogress", title: "En cours" },
  { id: "done", title: "Terminé" },
];

const initialNewTaskData = {
  content: "",
  description: "",
  startDate: undefined,
  endDate: undefined,
};

const KanbanView = () => {
  const { domainId } = useParams();
  const { domains, tasks, setTasks, addTask, updateTask, deleteTask, updateDomain } = useData();
  const domain = domains.find(d => d.id === domainId);

  const [columns] = useState<Column[]>(initialColumns);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const domainTasks = useMemo(() => tasks.filter(task => task.domainId === domainId), [tasks, domainId]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState<{content: string; description: string; startDate?: string; endDate?: string;}>(initialNewTaskData);

  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editedTaskData, setEditedTaskData] = useState({ content: "", description: "", startDate: undefined, endDate: undefined });

  const [isEditingDomainDesc, setIsEditingDomainDesc] = useState(false);
  const [editedDomainDesc, setEditedDomainDesc] = useState(domain?.description || "");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleAddTask = () => {
    if (!newTaskData.content.trim() || !domainId) return;
    addTask(domainId, {
        content: newTaskData.content.trim(),
        description: newTaskData.description.trim() || undefined,
        startDate: newTaskData.startDate,
        endDate: newTaskData.endDate,
    });
    setNewTaskData(initialNewTaskData);
    setIsAddDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const handleOpenEditDialog = (task: Task) => {
    setTaskToEdit(task);
    setEditedTaskData({
      content: task.content,
      description: task.description || "",
      startDate: task.startDate,
      endDate: task.endDate,
    });
  };

  const handleUpdateTask = () => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, editedTaskData);
      setTaskToEdit(null);
    }
  };

  const handleUpdateDomainDesc = () => {
    if (domain) {
        updateDomain(domain.id, { description: editedDomainDesc });
        setIsEditingDomainDesc(false);
    }
  }

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
    <div className="p-4 md:p-8">
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-primary">
          Vue d'ensemble
        </Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="font-medium text-primary capitalize">{domain?.title}</span>
      </div>

      <h1 className="text-3xl font-bold mb-4 capitalize">
        Tableau Kanban : {domain?.title}
      </h1>

      <div className="mb-8 p-4 border rounded-lg bg-secondary/50">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Description du domaine</h2>
            {!isEditingDomainDesc && (
                <Button variant="ghost" size="icon" onClick={() => { setIsEditingDomainDesc(true); setEditedDomainDesc(domain?.description || ""); }}>
                    <Pencil className="w-4 h-4" />
                </Button>
            )}
        </div>
        {isEditingDomainDesc ? (
            <div>
                <Textarea
                    value={editedDomainDesc}
                    onChange={(e) => setEditedDomainDesc(e.target.value)}
                    className="min-h-[100px] mb-2"
                    placeholder="Ajoutez une description pour ce domaine..."
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsEditingDomainDesc(false)}>Annuler</Button>
                    <Button onClick={handleUpdateDomainDesc}>Enregistrer</Button>
                </div>
            </div>
        ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">
                {domain?.description || "Aucune description pour ce domaine."}
            </p>
        )}
      </div>

      <div className="mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> Ajouter une tâche
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle>Nouvelle tâche</DialogTitle></DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="new-task-content">Contenu</Label>
                        <Textarea id="new-task-content" value={newTaskData.content} onChange={(e) => setNewTaskData(d => ({...d, content: e.target.value}))} className="min-h-[100px]" placeholder="Contenu principal de la tâche..." />
                    </div>
                    <div>
                        <Label htmlFor="new-task-description">Description (facultatif)</Label>
                        <Textarea id="new-task-description" value={newTaskData.description} onChange={(e) => setNewTaskData(d => ({...d, description: e.target.value}))} className="min-h-[100px]" placeholder="Ajoutez plus de détails..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Date de début</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newTaskData.startDate ? format(new Date(newTaskData.startDate), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={newTaskData.startDate ? new Date(newTaskData.startDate) : undefined} onSelect={(date) => setNewTaskData(d => ({...d, startDate: date?.toISOString()}))} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label>Date de fin</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newTaskData.endDate ? format(new Date(newTaskData.endDate), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={newTaskData.endDate ? new Date(newTaskData.endDate) : undefined} onSelect={(date) => setNewTaskData(d => ({...d, endDate: date?.toISOString()}))} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                    <Button type="button" onClick={handleAddTask} disabled={!newTaskData.content.trim()}>Enregistrer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Modifier la tâche</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="task-content">Contenu</Label>
              <Textarea id="task-content" value={editedTaskData.content} onChange={(e) => setEditedTaskData(d => ({...d, content: e.target.value}))} className="min-h-[100px]" />
            </div>
            <div>
              <Label htmlFor="task-description">Description (facultatif)</Label>
              <Textarea id="task-description" value={editedTaskData.description} onChange={(e) => setEditedTaskData(d => ({...d, description: e.target.value}))} className="min-h-[100px]" placeholder="Ajoutez plus de détails..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTaskData.startDate ? format(new Date(editedTaskData.startDate), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedTaskData.startDate ? new Date(editedTaskData.startDate) : undefined}
                      onSelect={(date) => setEditedTaskData(d => ({...d, startDate: date?.toISOString()}))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTaskData.endDate ? format(new Date(editedTaskData.endDate), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedTaskData.endDate ? new Date(editedTaskData.endDate) : undefined}
                      onSelect={(date) => setEditedTaskData(d => ({...d, endDate: date?.toISOString()}))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
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