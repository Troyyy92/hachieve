import { Link, useParams } from "react-router-dom";
import { ChevronRight, Plus, Pencil, Calendar as CalendarIcon, LogOut, Menu, Trash2, Star, Copy } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { TaskDetailsModal } from "@/components/TaskDetailsModal"; // Import the new modal

const initialColumnsConfig: { id: ColumnId; defaultTitleKey: string }[] = [
  { id: "todo", defaultTitleKey: "todoColumn" },
  { id: "inprogress", defaultTitleKey: "inProgressColumn" },
  { id: "done", defaultTitleKey: "doneColumn" },
];

const initialNewTaskData = {
  content: "",
  description: "",
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
  isAllDay: false,
  isPriority: false,
};

const KanbanView = () => {
  const { t, i18n } = useTranslation();
  const { domainId } = useParams();
  const { domains, tasks, setTasks, addTask, updateTask, deleteTask, updateDomain, duplicateTask } = useData();
  const domain = domains.find(d => d.id === domainId);
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const [showPriorityOnly, setShowPriorityOnly] = useState(false);

  const columns = useMemo(() => initialColumnsConfig
    .map(colConfig => {
      const title = t(`kanban.${colConfig.defaultTitleKey}`);
      if (typeof colConfig.id === 'string' && typeof title === 'string') {
        return {
          id: colConfig.id,
          title: title
        } as Column;
      }
      console.warn(`Invalid column configuration or translation for key: kanban.${colConfig.defaultTitleKey}. Resulting title: ${title}`);
      return null;
    })
    .filter((col): col is Column => col !== null),
    [t, i18n.language]
  );

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const domainTasks = useMemo(() => {
    let filteredTasks = tasks.filter(task => task.domainId === domainId);

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(
        task =>
          task.content.toLowerCase().includes(lowerCaseSearchTerm) ||
          (task.description && task.description.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    if (showPriorityOnly) {
      filteredTasks = filteredTasks.filter(task => task.isPriority);
    }

    return filteredTasks;
  }, [tasks, domainId, searchTerm, showPriorityOnly]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState(initialNewTaskData);

  const [taskToEditOrView, setTaskToEditOrView] = useState<Task | null>(null); // State for the new reusable modal

  const [isEditingDomainDesc, setIsEditingDomainDesc] = useState(false);
  const [editedDomainDesc, setEditedDomainDesc] = useState(domain?.description || "");

  const [isEditingDomainTitle, setIsEditingDomainTitle] = useState(false);
  const [editedDomainTitle, setEditedDomainTitle] = useState(domain?.title || "");

  const domainTitleRef = useRef<HTMLHeadingElement>(null);
  const [descriptionContainerMaxWidth, setDescriptionContainerMaxWidth] = useState<number | 'none'>('none');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  useEffect(() => {
    const calculateMaxWidth = () => {
      if (!isMobile && domainTitleRef.current) {
        const titleWidth = domainTitleRef.current.offsetWidth;
        const screenWidth = window.innerWidth;

        const minAllowedWidth = screenWidth / 3;
        const maxAllowedWidth = screenWidth * 0.5;

        let calculatedWidth = Math.min(titleWidth, maxAllowedWidth);
        calculatedWidth = Math.max(minAllowedWidth, calculatedWidth);
        
        setDescriptionContainerMaxWidth(calculatedWidth);
      } else {
        setDescriptionContainerMaxWidth('none');
      }
    };

    calculateMaxWidth();

    window.addEventListener('resize', calculateMaxWidth);
    return () => window.removeEventListener('change', calculateMaxWidth);
  }, [domain?.title, isMobile]);

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
        isPriority: newTaskData.isPriority,
    });
    setNewTaskData(initialNewTaskData);
    setIsAddDialogOpen(false);
  };

  const handleUpdateDomainDesc = () => {
    if (domain) {
        updateDomain(domain.id, { description: editedDomainDesc });
        setIsEditingDomainDesc(false);
    }
  }

  const handleUpdateDomainTitle = () => {
    if (domain && editedDomainTitle.trim()) {
      updateDomain(domain.id, { title: editedDomainTitle.trim() });
      setIsEditingDomainTitle(false);
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
    setData: React.Dispatch<React.SetStateAction<typeof initialNewTaskData>>
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

  const handleOpenTaskDetails = (task: Task) => {
    setTaskToEditOrView(task);
  };

  const getColumnTitle = (columnId: ColumnId) => {
    const column = columns.find(col => col.id === columnId);
    return column ? column.title : '';
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            {t('common.overview')}
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="font-medium text-primary capitalize max-w-[150px] truncate">{domain?.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
          <div className="hidden md:flex">
            <LanguageSwitcher />
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="hidden md:flex"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('common.logout')}
          </Button>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center justify-between">
                  <span>{t('common.theme')}</span>
                  <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LanguageSwitcher />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('common.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {isEditingDomainTitle ? (
          <div className="flex items-center w-full max-w-md">
            <Input
              value={editedDomainTitle}
              onChange={(e) => setEditedDomainTitle(e.target.value)}
              className="text-3xl font-bold capitalize flex-grow"
              placeholder={t('index.domainName')}
              maxLength={50}
            />
            <Button variant="ghost" onClick={() => setIsEditingDomainTitle(false)} className="ml-2">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdateDomainTitle} disabled={!editedDomainTitle.trim()} className="ml-2">
              {t('common.save')}
            </Button>
          </div>
        ) : (
          <h1 ref={domainTitleRef} className="text-3xl font-bold capitalize flex items-center gap-2 min-w-0">
            <span className="truncate">{domain?.title}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => { 
                setIsEditingDomainTitle(true); 
                setEditedDomainTitle(domain?.title || ""); 
              }}
              className="h-8 w-8 flex-shrink-0"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </h1>
        )}
      </div>

      <div 
        className="mb-8 p-4 rounded-lg bg-secondary/50"
        style={!isMobile ? { maxWidth: descriptionContainerMaxWidth !== 'none' ? `${descriptionContainerMaxWidth}px` : 'none' } : {}}
      >
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">{t('kanban.domainDescriptionTitle')}</h2>
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
                    placeholder={t('index.addDomainCardDescription')}
                    maxLength={300}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{editedDomainDesc.length}/300</p>
                <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" onClick={() => setIsEditingDomainDesc(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleUpdateDomainDesc}>
                      {t('common.save')}
                    </Button>
                </div>
            </div>
        ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">
                {domain?.description || t('common.noDescription')}
            </p>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto sm:max-w-md">
          <Label htmlFor="task-search" className="sr-only">{t('kanban.searchTasks')}</Label>
          <Input
            id="task-search"
            placeholder={t('kanban.searchTasksPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-priority-only"
            checked={showPriorityOnly}
            onCheckedChange={(checked) => setShowPriorityOnly(!!checked)}
          />
          <Label htmlFor="show-priority-only">{t('kanban.showPriorityOnly')}</Label>
        </div>
      </div>

      <div className="mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> {t('kanban.addTaskButton')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>{t('kanban.newTaskTitle')}</DialogTitle></DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="new-task-content">{t('common.content')}</Label>
                        <Textarea id="new-task-content" value={newTaskData.content} onChange={(e) => setNewTaskData(d => ({...d, content: e.target.value}))} className="min-h-[100px]" placeholder={t('kanban.newTaskDescription')} maxLength={50} />
                        <p className="text-xs text-muted-foreground text-right mt-1">{newTaskData.content.length}/50</p>
                    </div>
                    <div>
                        <Label htmlFor="new-task-description">{t('common.description')} ({t('common.optional')})</Label>
                        <Textarea id="new-task-description" value={newTaskData.description} onChange={(e) => setNewTaskData(d => ({...d, description: e.target.value}))} className="min-h-[100px]" placeholder={t('kanban.taskDescriptionPlaceholder')} maxLength={300} />
                        <p className="text-xs text-muted-foreground text-right mt-1">{newTaskData.description.length}/300</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="new-isAllDay" checked={newTaskData.isAllDay} onCheckedChange={(checked) => setNewTaskData(d => ({...d, isAllDay: !!checked}))} />
                        <Label htmlFor="new-isAllDay">{t('common.allDay')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="new-isPriority" checked={newTaskData.isPriority} onCheckedChange={(checked) => setNewTaskData(d => ({...d, isPriority: !!checked}))} />
                        <Label htmlFor="new-isPriority">{t('common.priority')}</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>{t('common.startDate')} ({t('common.optional')})</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newTaskData.startDate ? format(newTaskData.startDate, "PPP", { locale: i18n.language === 'fr' ? fr : undefined }) : null}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar 
                                        mode="single" 
                                        selected={newTaskData.startDate} 
                                        onSelect={(date) => setNewTaskData(d => ({...d, startDate: date ?? undefined, endDate: (d.endDate && date && d.endDate < date) ? undefined : d.endDate}))} 
                                        disabled={newTaskData.endDate ? { after: newTaskData.endDate } : undefined}
                                        initialFocus 
                                        locale={i18n.language === 'fr' ? fr : undefined}
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
                            <Label>{t('common.endDate')} ({t('common.optional')})</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newTaskData.endDate ? format(newTaskData.endDate, "PPP", { locale: i18n.language === 'fr' ? fr : undefined }) : null}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar 
                                        mode="single" 
                                        selected={newTaskData.endDate} 
                                        onSelect={(date) => setNewTaskData(d => ({...d, endDate: date ?? undefined}))} 
                                        disabled={newTaskData.startDate ? { before: newTaskData.startDate } : undefined}
                                        initialFocus 
                                        locale={i18n.language === 'fr' ? fr : undefined}
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
                onViewTask={handleOpenTaskDetails} // Use the new handler
                onEditTask={handleOpenTaskDetails} // Use the new handler
                onDeleteTask={() => {}} // Handled by TaskDetailsModal
                onDuplicateTask={() => {}} // Handled by TaskDetailsModal
                onTogglePriorityTask={() => {}} // Handled by TaskDetailsModal
              />
            ))}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeTask && <KanbanTaskCard 
            task={activeTask} 
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            onDuplicate={() => {}}
            onTogglePriority={() => {}}
          />}
        </DragOverlay>
      </DndContext>

      <TaskDetailsModal
        isOpen={!!taskToEditOrView}
        onOpenChange={(open) => !open && setTaskToEditOrView(null)}
        task={taskToEditOrView}
        columns={columns}
        getColumnTitle={getColumnTitle}
      />
    </div>
  );
};

export default KanbanView;