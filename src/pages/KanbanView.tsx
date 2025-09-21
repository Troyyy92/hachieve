import { Link, useParams } from "react-router-dom";
import { ChevronRight, Plus, Pencil, Calendar as CalendarIcon, LogOut } from "lucide-react";
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
import { fr, enUS } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const initialColumns: Column[] = [
  { id: "todo", title: "À faire" },
  { id: "inprogress", title: "En cours" },
  { id: "done", title: "Terminé" },
];

const initialNewTaskData = {
  content: "",
  description: "",
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
  isAllDay: false,
};

const KanbanView = () => {
  const { domainId } = useParams();
  const { domains, tasks, setTasks, addTask, updateTask, deleteTask, updateDomain } = useData();
  const domain = domains.find(d => d.id === domainId);
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : fr;

  const columns: Column[] = useMemo(() => [
    { id: "todo", title: t('kanban.todo') },
    { id: "inprogress", title: t('kanban.inprogress') },
    { id: "done", title: t('kanban.done') },
  ], [t]);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const domainTasks = useMemo(() => tasks.filter(task => task.domainId === domainId), [tasks, domainId]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState(initialNewTaskData);

  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editedTaskData, setEditedTaskData] = useState({ ...initialNewTaskData });

  const [isEditingDomainDesc, setIsEditingDomainDesc] = useState(false);
  const [editedDomainDesc, setEditedDomainDesc] = useState(domain?.description || "");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddTask = () => {
    if (!newTaskData.content.trim() || !domainId) return;
    addTask(domainId, {
        content: newTaskData.content.trim(),
        description: newTaskData.description.trim() || undefined,
        startDate: newTaskData.startDate?.toISOString(),
        endDate: newTaskData.endDate?.toISOString(),
        isAllDay: newTaskData.isAllDay,
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
      startDate: task.startDate ? new Date(task.startDate) : undefined,
      endDate: task.endDate ? new Date(task.endDate) : undefined,
      isAllDay: task.isAllDay ?? false,
    });
  };

  const handleUpdateTask = () => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        content: editedTaskData.content,
        description: editedTaskData.description,
        startDate: editedTaskData.startDate?.toISOString(),
        endDate: editedTaskData.endDate?.toISOString(),
        isAllDay: editedTaskData.isAllDay,
      });
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

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overIsColumn = over.data.current?.type === "Column";
    const overIsTask = over.data.current?.type === "Task";
    
    let newColumnId: ColumnId | undefined;

    if (overIsColumn) {
      newColumnId = over.id as ColumnId;
    } else if (overIsTask) {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newColumnId = overTask.columnId;
      }
    }

    if (newColumnId && activeTask.columnId !== newColumnId) {
      updateTask(active.id as string, { columnId: newColumnId });
    }

    setTasks((currentTasks) => {
      const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
      const overIndex = currentTasks.findIndex((t) => t.id === overId);

      if (overIsTask) {
        return arrayMove(currentTasks, activeIndex, overIndex);
      }
      if (overIsColumn) {
        const newTasks = [...currentTasks];
        if (newColumnId) {
          newTasks[activeIndex] = { ...activeTask, columnId: newColumnId };
        }
        return newTasks;
      }
      return currentTasks;
    });
  };

  const handleTimeChange = (
    field: 'startDate' | 'endDate',
    time: string,
    setData: React.Dispatch<React.SetStateAction<typeof newTaskData>>
  ) => {
    setData(d => {
      const currentDate = d[field];
      if (currentDate) {
        const newDate = new Date(currentDate);
        const [hours, minutes] = time.split(':').map(Number);
        newDate.setHours(hours, minutes);
        return { ...d, [field]: newDate };
      }
      return d;
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            {t('kanban.overview')}
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="font-medium text-primary capitalize">{domain?.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="hidden sm:flex"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('common.logout')}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleLogout}
            className="sm:hidden"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4 capitalize">
        {t('kanban.kanbanBoard')} : {domain?.title}
      </h1>

      <div className="mb-8 p-4 rounded-lg bg-secondary/50">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">{t('kanban.domainDescription')}</h2>
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
                    placeholder={t('taskForm.descriptionPlaceholder')}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsEditingDomainDesc(false)}>{t('common.cancel')}</Button>
                    <Button onClick={handleUpdateDomainDesc}>{t('common.save')}</Button>
                </div>
            </div>
        ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">
                {domain?.description || t('kanban.noDomainDescription')}
            </p>
        )}
      </div>

      <div className="mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> {t('kanban.addTask')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle>{t('kanban.newTask')}</DialogTitle></DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="new-task-content">{t('taskForm.content')}</Label>
                        <Textarea id="new-task-content" value={newTaskData.content} onChange={(e) => setNewTaskData(d => ({...d, content: e.target.value}))} className="min-h-[100px]" placeholder={t('taskForm.contentPlaceholder')} />
                    </div>
                    <div>
                        <Label htmlFor="new-task-description">{t('taskForm.description')} ({t('common.optional')})</Label>
                        <Textarea id="new-task-description" value={newTaskData.description} onChange={(e) => setNewTaskData(d => ({...d, description: e.target.value}))} className="min-h-[100px]" placeholder={t('taskForm.descriptionPlaceholder')} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="new-isAllDay" checked={newTaskData.isAllDay} onCheckedChange={(checked) => setNewTaskData(d => ({...d, isAllDay: !!checked}))} />
                        <Label htmlFor="new-isAllDay">{t('common.allDay')}</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>{t('taskForm.startDate')} ({t('common.optional')})</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newTaskData.startDate ? format(newTaskData.startDate, "PPP", { locale: dateLocale }) : <span>{t('taskForm.chooseDate')}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar 
                                        mode="single" 
                                        selected={newTaskData.startDate} 
                                        onSelect={(date) => setNewTaskData(d => ({...d, startDate: date ?? undefined, endDate: (d.endDate && date && d.endDate < date) ? undefined : d.endDate}))} 
                                        disabled={newTaskData.endDate ? { after: newTaskData.endDate } : undefined}
                                        initialFocus 
                                        locale={dateLocale}
                                    />
                                </PopoverContent>
                            </Popover>
                            {!newTaskData.isAllDay && (
                                <Input 
                                    type="time" 
                                    className="mt-2" 
                                    value={newTaskData.startDate ? format(newTaskData.startDate, 'HH:mm') : ''} 
                                    onChange={(e) => handleTimeChange('startDate', e.target.value, setNewTaskData)}
                                    disabled={!newTaskData.startDate}
                                />
                            )}
                        </div>
                        <div>
                            <Label>{t('taskForm.endDate')} ({t('common.optional')})</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newTaskData.endDate ? format(newTaskData.endDate, "PPP", { locale: dateLocale }) : <span>{t('taskForm.chooseDate')}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar 
                                        mode="single" 
                                        selected={newTaskData.endDate} 
                                        onSelect={(date) => setNewTaskData(d => ({...d, endDate: date ?? undefined}))} 
                                        disabled={newTaskData.startDate ? { before: newTaskData.startDate } : undefined}
                                        initialFocus 
                                        locale={dateLocale}
                                    />
                                </PopoverContent>
                            </Popover>
                            {!newTaskData.isAllDay && (
                                <Input 
                                    type="time" 
                                    className="mt-2" 
                                    value={newTaskData.endDate ? format(newTaskData.endDate, 'HH:mm') : ''} 
                                    onChange={(e) => handleTimeChange('endDate', e.target.value, setNewTaskData)}
                                    disabled={!newTaskData.endDate}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">{t('common.cancel')}</Button></DialogClose>
                    <Button type="button" onClick={handleAddTask} disabled={!newTaskData.content.trim()}>{t('common.save')}</Button>
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
                tasks={domainTasks
                  .filter((task) => task.columnId === col.id)
                  .sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0))
                }
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
          <DialogHeader><DialogTitle>{t('kanban.editTask')}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="task-content">{t('taskForm.content')}</Label>
              <Textarea id="task-content" value={editedTaskData.content} onChange={(e) => setEditedTaskData(d => ({...d, content: e.target.value}))} className="min-h-[100px]" />
            </div>
            <div>
              <Label htmlFor="task-description">{t('taskForm.description')} ({t('common.optional')})</Label>
              <Textarea id="task-description" value={editedTaskData.description} onChange={(e) => setEditedTaskData(d => ({...d, description: e.target.value}))} className="min-h-[100px]" placeholder={t('taskForm.descriptionPlaceholder')} />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="edit-isAllDay" checked={editedTaskData.isAllDay} onCheckedChange={(checked) => setEditedTaskData(d => ({...d, isAllDay: !!checked}))} />
                <Label htmlFor="edit-isAllDay">{t('common.allDay')}</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('taskForm.startDate')} ({t('common.optional')})</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTaskData.startDate ? format(editedTaskData.startDate, "PPP", { locale: dateLocale }) : <span>{t('taskForm.chooseDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedTaskData.startDate}
                      onSelect={(date) => setEditedTaskData(d => ({...d, startDate: date ?? undefined, endDate: (d.endDate && date && d.endDate < date) ? undefined : d.endDate}))}
                      disabled={editedTaskData.endDate ? { after: editedTaskData.endDate } : undefined}
                      initialFocus
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
                {!editedTaskData.isAllDay && (
                    <Input 
                        type="time" 
                        className="mt-2" 
                        value={editedTaskData.startDate ? format(editedTaskData.startDate, 'HH:mm') : ''} 
                        onChange={(e) => handleTimeChange('startDate', e.target.value, setEditedTaskData)}
                        disabled={!editedTaskData.startDate}
                    />
                )}
              </div>
              <div>
                <Label>{t('taskForm.endDate')} ({t('common.optional')})</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTaskData.endDate ? format(editedTaskData.endDate, "PPP", { locale: dateLocale }) : <span>{t('taskForm.chooseDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedTaskData.endDate}
                      onSelect={(date) => setEditedTaskData(d => ({...d, endDate: date ?? undefined}))}
                      disabled={editedTaskData.startDate ? { before: editedTaskData.startDate } : undefined}
                      initialFocus
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
                {!editedTaskData.isAllDay && (
                    <Input 
                        type="time" 
                        className="mt-2" 
                        value={editedTaskData.endDate ? format(editedTaskData.endDate, 'HH:mm') : ''} 
                        onChange={(e) => handleTimeChange('endDate', e.target.value, setEditedTaskData)}
                        disabled={!editedTaskData.endDate}
                    />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">{t('common.cancel')}</Button></DialogClose>
            <Button type="button" onClick={handleUpdateTask}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>{t('kanban.deleteTaskConfirmation')}</AlertDialogDescription>
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

export default KanbanView;