import React, { useState, useEffect } from 'react';
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
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon, Trash2, Pencil, Copy, Star } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Task, Column, ColumnId } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'; // Keep import for status select
import { cn } from '@/lib/utils';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  columns: Column[];
  getColumnTitle: (columnId: ColumnId) => string;
}

const initialTaskData = {
  content: "",
  description: "",
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
  isAllDay: false,
  isPriority: false,
  columnId: "todo" as ColumnId,
};

export const TaskDetailsModal = ({ isOpen, onOpenChange, task, columns, getColumnTitle }: TaskDetailsModalProps) => {
  const { t, i18n } = useTranslation();
  const { updateTask, deleteTask, duplicateTask } = useData();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const [editedTaskData, setEditedTaskData] = useState(initialTaskData);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setEditedTaskData({
        content: task.content,
        description: task.description || "",
        startDate: task.startDate ? new Date(task.startDate) : undefined,
        endDate: task.endDate ? new Date(task.endDate) : undefined,
        isAllDay: task.isAllDay ?? false,
        isPriority: task.isPriority ?? false,
        columnId: task.columnId,
      });
    } else {
      setEditedTaskData(initialTaskData);
    }
  }, [task]);

  const handleUpdateTask = () => {
    if (task) {
      updateTask(task.id, {
        content: editedTaskData.content,
        description: editedTaskData.description,
        startDate: editedTaskData.startDate?.toISOString(),
        endDate: editedTaskData.endDate?.toISOString(),
        isAllDay: editedTaskData.isAllDay,
        isPriority: editedTaskData.isPriority,
        columnId: editedTaskData.columnId,
      });
      onOpenChange(false);
    }
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
      onOpenChange(false);
    }
  };

  const handleDuplicateClick = () => {
    if (task) {
      duplicateTask(task.id);
      onOpenChange(false);
    }
  };

  const handleTogglePriorityClick = () => {
    if (task) {
      setEditedTaskData(prev => ({ ...prev, isPriority: !prev.isPriority }));
      updateTask(task.id, { isPriority: !task.isPriority });
    }
  };

  const handleTimeChange = (
    field: 'startDate' | 'endDate',
    time: string,
  ) => {
    setEditedTaskData(d => {
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

  if (!task) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{task.content}</DialogTitle>
            {editedTaskData.isPriority && (
              <div className="flex items-center text-yellow-500">
                <Star className="h-4 w-4 mr-1 fill-yellow-400" />
                <span>{t('common.priority')}</span>
              </div>
            )}
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="task-content">{t('common.content')}</Label>
              <Textarea id="task-content" value={editedTaskData.content} onChange={(e) => setEditedTaskData(d => ({...d, content: e.target.value}))} className="min-h-[100px]" maxLength={50} />
              <p className="text-xs text-muted-foreground text-right mt-1">{editedTaskData.content.length}/50</p>
            </div>
            <div>
              <Label htmlFor="task-description">{t('common.description')} ({t('common.optional')})</Label>
              <Textarea id="task-description" value={editedTaskData.description} onChange={(e) => setEditedTaskData(d => ({...d, description: e.target.value}))} className="min-h-[100px]" placeholder={t('kanban.taskDescriptionPlaceholder')} maxLength={300} />
              <p className="text-xs text-muted-foreground text-right mt-1">{editedTaskData.description.length}/300</p>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="edit-isAllDay" checked={editedTaskData.isAllDay} onCheckedChange={(checked) => setEditedTaskData(d => ({...d, isAllDay: !!checked}))} />
                <Label htmlFor="edit-isAllDay">{t('common.allDay')}</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="edit-isPriority" checked={editedTaskData.isPriority} onCheckedChange={(checked) => setEditedTaskData(d => ({...d, isPriority: !!checked}))} />
                <Label htmlFor="edit-isPriority">{t('common.priority')}</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('common.startDate')} ({t('common.optional')})</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTaskData.startDate ? format(editedTaskData.startDate, "PPP", { locale: currentLocale }) : null}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedTaskData.startDate}
                      onSelect={(date) => setEditedTaskData(d => ({...d, startDate: date ?? undefined, endDate: (d.endDate && date && d.endDate < date) ? undefined : d.endDate}))}
                      disabled={editedTaskData.endDate ? { after: editedTaskData.endDate } : undefined}
                      initialFocus
                      locale={currentLocale}
                    />
                  </PopoverContent>
                </Popover>
                {!editedTaskData.isAllDay && (
                    <Input 
                        type="time" 
                        className="mt-2" 
                        value={editedTaskData.startDate ? format(editedTaskData.startDate, 'HH:mm') : ''} 
                        onChange={(e) => handleTimeChange('startDate', e.target.value)}
                        disabled={!editedTaskData.startDate}
                    />
                )}
              </div>
              <div>
                <Label>{t('common.endDate')} ({t('common.optional')})</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTaskData.endDate ? format(editedTaskData.endDate, "PPP", { locale: currentLocale }) : null}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedTaskData.endDate}
                      onSelect={(date) => setEditedTaskData(d => ({...d, endDate: date ?? undefined}))}
                      disabled={editedTaskData.startDate ? { before: editedTaskData.startDate } : undefined}
                      initialFocus
                      locale={currentLocale}
                    />
                  </PopoverContent>
                </Popover>
                {!editedTaskData.isAllDay && (
                    <Input 
                        type="time" 
                        className="mt-2" 
                        value={editedTaskData.endDate ? format(editedTaskData.endDate, 'HH:mm') : ''} 
                        onChange={(e) => handleTimeChange('endDate', e.target.value)}
                        disabled={!editedTaskData.endDate}
                    />
                )}
              </div>
            </div>
            {/* Removed domain selection here */}
            <div>
              <Label htmlFor="task-status">{t('common.status')}</Label>
              <Select value={editedTaskData.columnId} onValueChange={(value: ColumnId) => setEditedTaskData(d => ({...d, columnId: value}))}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder={t('common.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleDuplicateClick}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleTogglePriorityClick}
                className={cn(editedTaskData.isPriority ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground")}
              >
                <Star className={`h-4 w-4 ${editedTaskData.isPriority ? "fill-yellow-400" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setTaskToDelete(task.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <DialogClose asChild><Button type="button" variant="secondary">{t('common.cancel')}</Button></DialogClose>
              <Button type="button" onClick={handleUpdateTask} disabled={!editedTaskData.content.trim()}>{t('common.save')}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('kanban.taskDeleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('kanban.taskDeleteConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};