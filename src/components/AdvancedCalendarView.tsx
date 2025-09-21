import { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useData } from '@/contexts/DataContext';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { CustomToolbar } from './calendar/CustomToolbar';
import { CustomEvent } from './calendar/CustomEvent';
import { Task } from '@/types';
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
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { Calendar as CalendarPicker } from './ui/calendar';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    fr,
  },
});

const initialTaskData = {
  content: "",
  description: "",
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
  isAllDay: false,
};

export const AdvancedCalendarView = () => {
  const { tasks, domains, updateTask, deleteTask } = useData();
  const isMobile = useBreakpoint(414);

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [editedTaskData, setEditedTaskData] = useState(initialTaskData);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const events = useMemo(() => {
    return tasks
      .filter(task => task.startDate)
      .map(task => {
        const domain = domains.find(d => d.id === task.domainId);
        return {
          id: task.id,
          title: task.content,
          start: new Date(task.startDate!),
          end: new Date(task.endDate || task.startDate!),
          allDay: task.isAllDay ?? true,
          isDone: task.columnId === 'done',
          domainTitle: domain?.title,
          isPriority: task.isPriority,
        };
      });
  }, [tasks, domains]);

  const handleSelectEvent = (event: any) => {
    const task = tasks.find(t => t.id === event.id);
    if (task) {
      setTaskToEdit(task);
      setEditedTaskData({
        content: task.content,
        description: task.description || "",
        startDate: task.startDate ? new Date(task.startDate) : undefined,
        endDate: task.endDate ? new Date(task.endDate) : undefined,
        isAllDay: task.isAllDay ?? false,
      });
    }
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

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
      setTaskToEdit(null);
    }
  };

  const handleTimeChange = (
    field: 'startDate' | 'endDate',
    time: string,
    setData: React.Dispatch<React.SetStateAction<typeof editedTaskData>>
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

  const components = useMemo(() => ({
    toolbar: (props: ToolbarProps) => <CustomToolbar {...props} />,
    event: (props: { event: any }) => <CustomEvent event={props.event} />,
  }), []);

  const formats = useMemo(() => ({
    eventTimeRangeFormat: () => null,
  }), []);

  return (
    <>
      <div className="mt-8 h-[70vh] bg-[#fbf7ea4a] backdrop-blur-sm p-4 rounded-lg calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={isMobile ? Views.DAY : Views.WEEK}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          culture='fr'
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
            date: "Date",
            time: "Heure",
            event: "Événement",
            noEventsInRange: "Aucun événement dans cette période.",
            showMore: total => `+ ${total} de plus`
          }}
          onSelectEvent={handleSelectEvent}
          components={components}
          formats={formats}
        />
      </div>

      <Dialog open={!!taskToEdit} onOpenChange={() => setTaskToEdit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="task-content">Contenu</Label>
              <Textarea id="task-content" value={editedTaskData.content} onChange={(e) => setEditedTaskData(d => ({...d, content: e.target.value}))} className="min-h-[100px]" />
            </div>
            <div>
              <Label htmlFor="task-description">Description (facultatif)</Label>
              <Textarea id="task-description" value={editedTaskData.description} onChange={(e) => setEditedTaskData(d => ({...d, description: e.target.value}))} className="min-h-[100px]" placeholder="Ajoutez plus de détails..." />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="edit-isAllDay" checked={editedTaskData.isAllDay} onCheckedChange={(checked) => setEditedTaskData(d => ({...d, isAllDay: !!checked}))} />
                <Label htmlFor="edit-isAllDay">Toute la journée</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début (facultatif)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTaskData.startDate ? format(editedTaskData.startDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarPicker
                      mode="single"
                      selected={editedTaskData.startDate}
                      onSelect={(date) => setEditedTaskData(d => ({...d, startDate: date ?? undefined, endDate: (d.endDate && date && d.endDate < date) ? undefined : d.endDate}))}
                      disabled={editedTaskData.endDate ? { after: editedTaskData.endDate } : undefined}
                      initialFocus
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
                <Label>Date de fin (facultatif)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedTaskData.endDate ? format(editedTaskData.endDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarPicker
                      mode="single"
                      selected={editedTaskData.endDate}
                      onSelect={(date) => setEditedTaskData(d => ({...d, endDate: date ?? undefined}))}
                      disabled={editedTaskData.startDate ? { before: editedTaskData.startDate } : undefined}
                      initialFocus
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
          <DialogFooter className="justify-between">
            <Button type="button" variant="destructive" onClick={() => setTaskToDelete(taskToEdit?.id || null)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
              <Button type="button" onClick={handleUpdateTask}>Enregistrer</Button>
            </div>
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