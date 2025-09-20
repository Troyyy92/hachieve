import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { isWithinInterval, startOfDay, endOfDay, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Star, Pencil, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Task } from '@/types';

export const CalendarView = () => {
  const { tasks, domains, updateTask, deleteTask } = useData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editedTaskData, setEditedTaskData] = useState({ content: "", description: "", startDate: undefined as string | undefined, endDate: undefined as string | undefined });
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const tasksWithDates = useMemo(() => {
    return tasks.filter(task => task.startDate);
  }, [tasks]);

  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return tasksWithDates
      .filter(task => {
        const start = startOfDay(parseISO(task.startDate!));
        const end = task.endDate ? endOfDay(parseISO(task.endDate)) : startOfDay(start);
        return isWithinInterval(startOfDay(selectedDate), { start, end });
      })
      .sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0));
  }, [tasksWithDates, selectedDate]);

  const modifiers = {
    hasTask: (date: Date) => {
      return tasksWithDates.some(task => {
        const start = startOfDay(parseISO(task.startDate!));
        const end = task.endDate ? endOfDay(parseISO(task.endDate)) : startOfDay(start);
        return isWithinInterval(date, { start, end });
      });
    }
  };

  const getDomainForTask = (domainId: string) => {
    return domains.find(d => d.id === domainId);
  };

  const handleTogglePriority = (task: Task) => {
    updateTask(task.id, { isPriority: !task.isPriority });
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
      updateTask(taskToEdit.id, {
        content: editedTaskData.content,
        description: editedTaskData.description,
        startDate: editedTaskData.startDate,
        endDate: editedTaskData.endDate,
      });
      setTaskToEdit(null);
    }
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-1 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            locale={fr}
            modifiers={modifiers}
            modifiersClassNames={{
              hasTask: 'day-with-task',
            }}
          />
        </div>
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">
            Tâches pour le {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: fr }) : '...'}
          </h2>
          <div className="space-y-4">
            {tasksForSelectedDay.length > 0 ? (
              tasksForSelectedDay.map(task => {
                const domain = getDomainForTask(task.domainId);
                return (
                  <div key={task.id} className="relative group">
                    <Card className={cn(task.isPriority && "bg-cyan-50 border-cyan-200")}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg pr-24">{task.content}</CardTitle>
                          {task.isPriority && <Star className="h-5 w-5 text-yellow-500 fill-yellow-400 flex-shrink-0" />}
                        </div>
                        {domain && (
                          <CardDescription>
                            Domaine : 
                            <Link to={`/domain/${domain.id}`} className="ml-1 text-primary hover:underline">
                              {domain.title}
                            </Link>
                          </CardDescription>
                        )}
                      </CardHeader>
                      {task.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </CardContent>
                      )}
                    </Card>
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTogglePriority(task)}>
                        <Star className={cn("h-4 w-4", task.isPriority ? "text-yellow-500 fill-yellow-400" : "text-muted-foreground")} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditDialog(task)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setTaskToDelete(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground">Aucune tâche planifiée pour ce jour.</p>
            )}
          </div>
        </div>
      </div>

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
                <Label>Date de début (facultatif)</Label>
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
                <Label>Date de fin (facultatif)</Label>
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
    </>
  );
};